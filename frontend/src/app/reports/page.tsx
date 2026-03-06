"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../page.module.css";
import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ReportsPage() {
    const [trends, setTrends] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await axios.get(`${API}/analysis/trends`);
                setTrends(res.data);
            } catch (err) {
                console.error("Failed to fetch trends:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    if (loading) return <div className={styles.center}><div className="spinner" /></div>;

    const trendData = {
        labels: ["작년 동월", "지난 달", "이번 달"],
        datasets: [{
            label: "지출 추이",
            data: [trends?.past_year.total, trends?.past_month.total, trends?.current_total],
            backgroundColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.2)", "#4f8ef7"],
            borderColor: "#4f8ef7",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: "#fff"
        }]
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <span className="badge badge-blue">📈 심층 분석</span>
                        <h1 className="mt-2">소비 트렌드 리포트</h1>
                        <p className="text-muted">사용자님의 소비 패턴이 어떻게 변하고 있는지 확인해 보세요.</p>
                    </div>
                </div>

                <div className={styles.heroSection} style={{ marginTop: '32px' }}>
                    {/* 전월 대비 카드 */}
                    <div className={styles.personaCard} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '220px' }}>
                        <div className={styles.personaBadge}>전월 대비</div>
                        <div style={{ marginTop: '20px' }}>
                            <h2 style={{ fontSize: '2.5rem' }}>{trends?.past_month.diff_ratio}% {trends?.past_month.diff_ratio > 0 ? '증가' : '감소'}</h2>
                            <p style={{ opacity: 0.8 }}>지난달보다 {formatPrice(Math.abs(trends?.current_total - trends?.past_month.total))} {trends?.past_month.diff_ratio > 0 ? '더 썼어요' : '덜 썼어요'}</p>
                        </div>
                    </div>

                    {/* 전년 대비 카드 */}
                    <div className={styles.personaCard} style={{ background: 'linear-gradient(135deg, #10d9a0 0%, #059669 100%)', minHeight: '220px' }}>
                        <div className={styles.personaBadge}>전년 동월 대비</div>
                        <div style={{ marginTop: '20px' }}>
                            <h2 style={{ fontSize: '2.5rem' }}>{trends?.past_year.diff_ratio}% {trends?.past_year.diff_ratio > 0 ? '증가' : '감소'}</h2>
                            <p style={{ opacity: 0.8 }}>작년 이맘때보다 {formatPrice(Math.abs(trends?.current_total - trends?.past_year.total))} {trends?.past_year.diff_ratio > 0 ? '더 썼어요' : '덜 썼어요'}</p>
                        </div>
                    </div>
                </div>

                <div className="card mt-8" style={{ padding: '40px' }}>
                    <h3 className="mb-8">월별 지출 추이 시각화</h3>
                    <div style={{ height: '350px' }}>
                        <Line
                            data={trendData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { ticks: { color: "#8896b3" }, grid: { color: "rgba(255,255,255,0.05)" } },
                                    x: { ticks: { color: "#8896b3" }, grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className={styles.v2ReportSection} style={{ marginTop: '40px' }}>
                    <div className={styles.predictionCard} style={{ padding: '32px' }}>
                        <div className={styles.predictInfo}>
                            <h3>AI 소비 총평</h3>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#fff', marginTop: '12px' }}>
                                {trends?.past_month.diff_ratio > 0 ?
                                    "⚠️ 지난달에 비해 소비가 늘어나는 추세입니다. 특히 배달/카페 카테고리를 점검해 보시는 것이 좋습니다." :
                                    "✨ 아주 훌륭해요! 지난달보다 지출을 잘 통제하고 계시네요. 이 추세를 유지하면 이번 달 저축 목표를 달성할 수 있습니다."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
