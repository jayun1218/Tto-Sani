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
import { Doughnut } from "react-chartjs-2";
import styles from "./page.module.css";
import MoneyTree from "@/components/MoneyTree";
import MissionCard from "@/components/MissionCard";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PALETTE = ["#4f8ef7", "#8b5cf6", "#10d9a0", "#f97316", "#ef4444"];

interface Progress {
    total_points: number;
    level: number;
    level_name: string;
}

interface Summary {
    total: number;
    count: number;
    by_category: { category: string; amount: number; ratio: number }[];
}

export default function HomePage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [progress, setProgress] = useState<Progress | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [summaryRes, progressRes] = await Promise.all([
                axios.get(`${API}/analysis/summary`),
                axios.get(`${API}/gamification/progress`)
            ]);
            setSummary(summaryRes.data);
            setProgress(progressRes.data);
        } catch (err) {
            console.error("데이터 로딩 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className={styles.center}>
            <div className="spinner" />
            <p className="mt-4">데이터를 불러오는 중...</p>
        </div>
    );

    const donutData = {
        labels: summary?.by_category.slice(0, 5).map(c => c.category) || [],
        datasets: [{
            data: summary?.by_category.slice(0, 5).map(c => c.amount) || [],
            backgroundColor: PALETTE,
            borderWidth: 0,
        }],
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>내 소비 대시보드 💰</h1>
                    <p className={styles.subtitle}>오늘의 지출을 확인하고 나무를 키워보세요!</p>
                </header>

                <div className={styles.mainGrid}>
                    {/* 왼쪽: 나무 & 미션 */}
                    <div className={styles.leftCol}>
                        <MoneyTree
                            level={progress?.level || 1}
                            levelName={progress?.level_name || "씨앗"}
                        />
                        <div className="mt-6">
                            <MissionCard onProgressUpdate={fetchData} />
                        </div>
                    </div>

                    {/* 오른쪽: 소비 요약 */}
                    <div className={styles.rightCol}>
                        <div className="card">
                            <h3 className="mb-4">이번 달 지출 요약</h3>
                            <div className={styles.totalBox}>
                                <span className={styles.totalLabel}>총 지출 금액</span>
                                <h2 className={styles.totalVal}>{summary?.total.toLocaleString()}원</h2>
                            </div>
                            <div className={styles.donutWrap}>
                                <Doughnut
                                    data={donutData}
                                    options={{ cutout: "70%", plugins: { legend: { position: "bottom" } } }}
                                />
                            </div>
                        </div>

                        <div className="card mt-6">
                            <h3 className="mb-4">주요 소비 항목</h3>
                            <div className={styles.catList}>
                                {summary?.by_category.slice(0, 3).map((cat, i) => (
                                    <div key={cat.category} className={styles.catItem}>
                                        <div className={styles.catInfo}>
                                            <span className={styles.catDot} style={{ background: PALETTE[i] }} />
                                            <span>{cat.category}</span>
                                        </div>
                                        <span className={styles.catAmt}>{cat.amount.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
