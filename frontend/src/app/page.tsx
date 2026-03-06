"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Chart,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PALETTE = [
    "#4f8ef7", "#8b5cf6", "#10d9a0", "#f97316",
    "#ef4444", "#fbbf24", "#06b6d4", "#ec4899",
];

interface CategoryItem { category: string; amount: number; ratio: number; }
interface Summary { total: number; count: number; by_category: CategoryItem[]; }

export default function HomePage() {
    const router = useRouter();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API}/analysis/summary`);
            setSummary(res.data);
        } catch (err) {
            setError("백엔드 서버에 연결할 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className={styles.center}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p className="mt-4">데이터를 분석 중입니다...</p>
        </div>
    );

    if (error || !summary || summary.count === 0) return (
        <div className={styles.center}>
            <p style={{ fontSize: "3rem" }}>📂</p>
            <h2 className="mt-4">{error || "소비 데이터가 없습니다"}</h2>
            <p className="text-muted mt-2">먼저 지출 내역을 추가하거나 CSV 파일을 업로드해주세요.</p>
            <div className="mt-6 flex gap-4">
                <Link href="/add" className="btn btn-primary">직접 추가하기</Link>
                <Link href="/upload" className="btn btn-outline">CSV 업로드하기</Link>
            </div>
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

    const chartOpts = {
        responsive: true,
        plugins: { legend: { labels: { color: "#8896b3", font: { size: 13 } } } },
    };
    const barOpts = {
        ...chartOpts,
        scales: {
            x: { ticks: { color: "#8896b3" }, grid: { color: "rgba(255,255,255,0.05)" } },
            y: { ticks: { color: "#8896b3" }, grid: { color: "rgba(255,255,255,0.05)" } },
        },
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <span className="badge badge-purple">📊 소비 분석</span>
                        <h1 className="mt-2">{new Date().getMonth() + 1}월 소비 현황</h1>
                    </div>
                    <Link href="/insights" className="btn btn-primary">절약 전략 보기 →</Link>
                </div>

                {/* 상단 히어로 섹션: 페르소나 카드 & 2x2 그리드 */}
                <div className={styles.heroSection}>
                    {/* 좌측: 페르소나 카드 */}
                    <div className={styles.personaCard} style={{
                        background: (summary.by_category[0]?.category === "카페" ? "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)" :
                            summary.by_category[0]?.category === "구독" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" :
                                summary.by_category[0]?.category === "식비" ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" :
                                    summary.by_category[0]?.category === "쇼핑" ? "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)" :
                                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)")
                    }}>
                        <div className={styles.personaBadge}>금주의 페르소나</div>
                        <div className={styles.avatarWrap}>
                            <span className={styles.personaEmoji}>
                                {summary.by_category[0]?.category === "카페" ? "☕" :
                                    summary.by_category[0]?.category === "구독" ? "🎬" :
                                        summary.by_category[0]?.category === "식비" ? "🍱" :
                                            summary.by_category[0]?.category === "쇼핑" ? "🛍️" : "💰"}
                            </span>
                        </div>
                        <div className={styles.personaInfo}>
                            <h2 className={styles.personaTitle}>
                                {summary.by_category[0]?.category === "카페" ? "커피 마니아" :
                                    summary.by_category[0]?.category === "구독" ? "프로 구독러" :
                                        summary.by_category[0]?.category === "식비" ? "진정한 미식가" :
                                            summary.by_category[0]?.category === "쇼핑" ? "패션 쇼퍼" : "알뜰 살뜰이"}
                            </h2>
                            <p className={styles.personaDesc}>사용자님의 소비 습관 분석 결과예요</p>
                        </div>
                    </div>

                    {/* 우측: 2x2 통계 그리드 */}
                    <div className={styles.statGrid2x2}>
                        {[
                            { label: "총 지출", value: `${summary.total.toLocaleString()}원`, icon: "💸" },
                            { label: "거래 건수", value: `${summary.count}건`, icon: "📝" },
                            { label: "주요 카테고리", value: summary.by_category[0]?.category ?? "-", icon: "🏆" },
                            { label: "최고 지출 비율", value: `${summary.by_category[0]?.ratio ?? 0}%`, icon: "📈" },
                        ].map(({ label, value, icon }) => (
                            <div key={label} className={styles.miniStatCard}>
                                <div className={styles.miniStatHeader}>
                                    <span className={styles.miniIcon}>{icon}</span>
                                    <span className={styles.miniLabel}>{label}</span>
                                </div>
                                <p className={styles.miniValue}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 차트 영역 */}
                <div className={styles.charts}>
                    <div className="card">
                        <h3 className="mb-4">카테고리별 소비 비율</h3>
                        <div className={styles.donutWrap}>
                            <Doughnut data={donutData} options={{ ...chartOpts, cutout: "65%" }} />
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="mb-4">카테고리별 지출 금액</h3>
                        <Bar data={barData} options={barOpts as any} />
                    </div>
                </div>

                {/* 테이블 */}
                <div className={`card ${styles.tableCard}`}>
                    <h3 className="mb-4">카테고리별 상세 내역</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>카테고리</th>
                                <th>지출 금액</th>
                                <th>비율</th>
                                <th>비중</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.by_category.map((item, i) => (
                                <tr key={item.category}>
                                    <td>
                                        <span className={styles.catDot} style={{ background: PALETTE[i % PALETTE.length] }} />
                                        {item.category}
                                    </td>
                                    <td className={styles.amount}>{item.amount.toLocaleString()}원</td>
                                    <td>{item.ratio}%</td>
                                    <td>
                                        <div className={styles.bar}>
                                            <div
                                                className={styles.barFill}
                                                style={{ width: `${item.ratio}%`, background: PALETTE[i % PALETTE.length] }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
