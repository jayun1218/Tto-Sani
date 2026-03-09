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
import LocationWarning from "@/components/LocationWarning";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PALETTE = [
    "#4f8ef7", "#8b5cf6", "#10d9a0", "#f97316",
    "#ef4444", "#fbbf24", "#06b6d4", "#ec4899",
];

interface CategoryItem { category: string; amount: number; ratio: number; }
interface Summary { total: number; count: number; by_category: CategoryItem[]; }

export default function Home() {
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [prediction, setPrediction] = useState<any>(null);
    const [watchdog, setWatchdog] = useState<any[]>([]);
    const [persona, setPersona] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    const fetchData = async () => {
        try {
            const [summaryRes, predictionRes, watchdogRes, personaRes] = await Promise.all([
                axios.get(`${API}/analysis/summary`),
                axios.get(`${API}/analysis/prediction`),
                axios.get(`${API}/analysis/watchdog`),
                axios.get(`${API}/analysis/persona`),
            ]);
            setSummary(summaryRes.data);
            setPrediction(predictionRes.data);
            setWatchdog(watchdogRes.data);
            setPersona(personaRes.data);
        } catch (err) {
            setError("백엔드 서버에 연결할 수 없습니다.");
            console.error("Failed to fetch data:", err);
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
            <div className="mt-6">
                <Link href="/add" className="btn btn-primary" style={{ padding: '12px 32px' }}>소비 내역 추가하러 가기 →</Link>
            </div>
        </div>
    );

    const donutData = {
        labels: summary.by_category.map((c: any) => c.category),
        datasets: [{
            data: summary.by_category.map((c: any) => c.amount),
            backgroundColor: PALETTE,
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const barData = {
        labels: summary.by_category.map((c: any) => c.category),
        datasets: [{
            label: "지출(원)",
            data: summary.by_category.map((c: any) => c.amount),
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

    const topCategory = summary.by_category[0]?.category;

    const getPersona = (category: string) => {
        switch (category) {
            case "카페":
                return {
                    emoji: "☕",
                    title: "커피 마니아",
                    desc: "사용자님의 소비 습관 분석 결과예요",
                    gradient: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)"
                };
            case "구독":
                return {
                    emoji: "🎬",
                    title: "프로 구독러",
                    desc: "사용자님의 소비 습관 분석 결과예요",
                    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                };
            case "식비":
                return {
                    emoji: "🍱",
                    title: "진정한 미식가",
                    desc: "사용자님의 소비 습관 분석 결과예요",
                    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                };
            case "쇼핑":
                return {
                    emoji: "🛍️",
                    title: "패션 쇼퍼",
                    desc: "사용자님의 소비 습관 분석 결과예요",
                    gradient: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)"
                };
            default:
                return {
                    emoji: "💰",
                    title: "알뜰 살뜰이",
                    desc: "사용자님의 소비 습관 분석 결과예요",
                    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                };
        }
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <LocationWarning personaName={persona?.persona} personaMessage={persona?.message} />
                <div className={styles.header}>
                    <div>
                        <span className="badge badge-purple">📊 소비 분석</span>
                        <h1 className="mt-2">{new Date().getMonth() + 1}월 소비 현황</h1>
                    </div>
                    <Link href="/insights" className="btn btn-primary">절약 전략 보기 →</Link>
                </div>

                {/* 상단 히어로 섹션: 페르소나 카드 & 2x2 그리드 */}
                <div className={styles.heroSection}>
                    {/* 페르소나 카드 (왼쪽) */}
                    <div className={styles.personaCard} style={{ background: getPersona(topCategory).gradient }}>
                        <div className={styles.personaBadge}>이번 달 페르소나</div>
                        <div className={styles.avatarWrap}>
                            <div className={styles.personaEmoji}>
                                {persona?.persona === "지름신 부엉이" ? "🦉" :
                                    persona?.persona === "카페인 중독 고양이" ? "🐱" :
                                        persona?.persona === "미식가 강아지" ? "🐶" :
                                            persona?.persona === "트렌드세터 여우" ? "🦊" :
                                                persona?.persona === "철벽 다람쥐" ? "🐿️" :
                                                    persona?.persona === "성실한 나무지기" ? "👨‍🌾" : "🌱"}
                            </div>
                        </div>
                        <div className={styles.personaInfo}>
                            <h2>{persona?.persona || "평범한 새싹"}</h2>
                            <p className={styles.personaDesc}>{persona?.message || "기록을 시작해볼까요?"}</p>
                        </div>
                    </div>

                    {/* 2x2 통계 그리드 (오른쪽) */}
                    <div className={styles.statGrid2x2}>
                        <div className={styles.miniStatCard}>
                            <div className={styles.miniStatHeader}>
                                <span className={styles.miniIcon}>💰</span>
                                <span className={styles.miniLabel}>총 지출</span>
                            </div>
                            <div className={styles.miniValue}>{formatPrice(summary.total)}</div>
                        </div>

                        <div className={styles.miniStatCard}>
                            <div className={styles.miniStatHeader}>
                                <span className={styles.miniIcon}>📝</span>
                                <span className={styles.miniLabel}>거래 건수</span>
                            </div>
                            <div className={styles.miniValue}>{summary.count}건</div>
                        </div>

                        <div className={styles.miniStatCard}>
                            <div className={styles.miniStatHeader}>
                                <span className={styles.miniIcon}>🏆</span>
                                <span className={styles.miniLabel}>주요 카테고리</span>
                            </div>
                            <div className={styles.miniValue}>{topCategory || '-'}</div>
                        </div>

                        <div className={styles.miniStatCard}>
                            <div className={styles.miniStatHeader}>
                                <span className={styles.miniIcon}>📈</span>
                                <span className={styles.miniLabel}>최고 지출 비율</span>
                            </div>
                            <div className={styles.miniValue}>{summary.by_category[0]?.ratio || 0}%</div>
                        </div>
                    </div>
                </div>

                {/* V2 지능형 리포트 섹션 */}
                {prediction && (
                    <div className={styles.v2ReportSection}>
                        <div className={styles.predictionCard}>
                            <div className={styles.predictInfo}>
                                <h3>이번 달 예상 총 지출</h3>
                                <div className={styles.predictValue}>{formatPrice(prediction.predicted_total)}</div>
                                <div className={`${styles.predictStatus} ${prediction.status === 'warning' ? styles.statusWarning : styles.statusNormal}`}>
                                    {prediction.status === 'warning' ? '⚠️ 지출 속도가 너무 빨라요!' : '✅ 평소와 비슷한 지출 속도예요.'}
                                </div>
                            </div>
                            <div className={`${styles.miniStatCard} ${styles.predictDetail}`}>
                                <div className={styles.miniLabel}>남은 기간 동안 하루 평균</div>
                                <div className={styles.miniValue} style={{ fontSize: '1.2rem' }}>{formatPrice(prediction.daily_avg)}</div>
                                <div className={styles.miniLabel} style={{ marginTop: '4px' }}>이하로 쓰시면 목표를 지킬 수 있어요!</div>
                            </div>
                        </div>

                        {/* 실시간 감시자 알림 */}
                        {watchdog.length > 0 && (
                            <div className={styles.watchdogSection}>
                                {watchdog.map((alert, idx) => (
                                    <div key={idx} className={styles.watchdogAlert}>
                                        <span className={styles.alertIcon}>🚨</span>
                                        <div>
                                            <strong>{alert.message}</strong>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>평소 평균 {formatPrice(alert.past_average)} 대비 {alert.increase_ratio}% 증가</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                            {summary.by_category.map((item: any, i: number) => (
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
