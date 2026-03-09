"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import styles from "./page.module.css";
import Link from "next/link";
import { API_URL as API } from "@/lib/constants";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PALETTE = ["#4f8ef7", "#8b5cf6", "#10d9a0", "#f97316", "#ef4444", "#fbbf24", "#06b6d4", "#ec4899"];

interface CategoryItem { category: string; amount: number; ratio: number; }
interface Summary { total: number; count: number; by_category: CategoryItem[]; }

export default function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get(`${API}/analysis/summary`)
            .then(r => setSummary(r.data))
            .catch(() => setError("백엔드 서버에 연결할 수 없습니다."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className={styles.center}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p className="text-muted mt-4">분석 중...</p>
        </div>
    );

    if (error || !summary || summary.count === 0) return (
        <div className={styles.center}>
            <p style={{ fontSize: "3rem" }}>📂</p>
            <h2 className="mt-4">{error || "소비 데이터가 없습니다"}</h2>
            <p className="text-muted mt-2">먼저 지출 내역을 추가하거나 CSV 파일을 업로드해주세요.</p>
            <Link href="/add" className="btn btn-primary mt-6">저장하러 가기 →</Link>
        </div>
    );

    const donutData = {
        labels: summary.by_category.map(c => c.category),
        datasets: [{
            data: summary.by_category.map(c => c.amount),
            backgroundColor: PALETTE,
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const barData = {
        labels: summary.by_category.map(c => c.category),
        datasets: [{
            label: "지출(원)",
            data: summary.by_category.map(c => c.amount),
            backgroundColor: PALETTE,
            borderRadius: 8,
        }],
    };

    const chartOpts = { responsive: true, plugins: { legend: { labels: { color: "#8896b3", font: { size: 13 } } } } };
    const barOpts = { ...chartOpts, scales: { x: { ticks: { color: "#8896b3" }, grid: { color: "rgba(255,255,255,0.05)" } }, y: { ticks: { color: "#8896b3" }, grid: { color: "rgba(255,255,255,0.05)" } } } };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <span className="badge badge-purple">📊 소비 분석</span>
                        <h1 className="mt-2">이번 달 소비 현황</h1>
                    </div>
                    <Link href="/insights" className="btn btn-primary">절약 전략 보기 →</Link>
                </div>
                <div className={`grid-4 ${styles.statGrid}`}>
                    {[
                        { label: "총 지출", value: `${summary.total.toLocaleString()}원`, icon: "💸" },
                        { label: "거래 건수", value: `${summary.count}건`, icon: "📝" },
                        { label: "주요 카테고리", value: summary.by_category[0]?.category ?? "-", icon: "🏆" },
                        { label: "최고 지출 비율", value: `${summary.by_category[0]?.ratio ?? 0}%`, icon: "📈" },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className={`card ${styles.statCard}`}>
                            <span className={styles.statIcon}>{icon}</span>
                            <p className="text-sm text-muted">{label}</p>
                            <p className={styles.statVal}>{value}</p>
                        </div>
                    ))}
                </div>
                <div className={styles.charts}>
                    <div className="card">
                        <h3 className="mb-4">카테고리별 소비 비율</h3>
                        <div className={styles.donutWrap}><Doughnut data={donutData} options={{ ...chartOpts, cutout: "65%" }} /></div>
                    </div>
                    <div className="card">
                        <h3 className="mb-4">카테고리별 지출 금액</h3>
                        <Bar data={barData} options={barOpts as any} />
                    </div>
                </div>
                <div className={`card ${styles.tableCard}`}>
                    <h3 className="mb-4">카테고리별 상세 내역</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>카테고리</th><th>지출 금액</th><th>비율</th><th>비중</th></tr>
                        </thead>
                        <tbody>
                            {summary.by_category.map((item, i) => (
                                <tr key={item.category}>
                                    <td><span className={styles.catDot} style={{ background: PALETTE[i % PALETTE.length] }} />{item.category}</td>
                                    <td className={styles.amount}>{item.amount.toLocaleString()}원</td>
                                    <td>{item.ratio}%</td>
                                    <td><div className={styles.bar}><div className={styles.barFill} style={{ width: `${item.ratio}%`, background: PALETTE[i % PALETTE.length] }} /></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
