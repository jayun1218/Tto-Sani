"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Warning {
    type: string;
    category: string;
    message: string;
    amount: number;
}
interface ImpulseItem {
    description: string;
    amount: number;
    category: string;
    date: string | null;
    reason: string;
}
interface ImpulseData {
    warnings: Warning[];
    impulse_items: ImpulseItem[];
    total_impulse_amount: number;
}

export default function InsightsPage() {
    const [tips, setTips] = useState("");
    const [impulse, setImpulse] = useState<ImpulseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/analysis/tips`),
            axios.get(`${API}/analysis/impulse`),
        ])
            .then(([tipsRes, impulseRes]) => {
                setTips(tipsRes.data.tips);
                setImpulse(impulseRes.data);
            })
            .catch(() => setError("데이터를 불러올 수 없습니다."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className={styles.center}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p className="text-muted mt-4">AI가 절약 전략을 분석 중입니다...</p>
        </div>
    );

    if (error) return (
        <div className={styles.center}>
            <p style={{ fontSize: "3rem" }}>⚠️</p>
            <h2 className="mt-4">{error}</h2>
            <Link href="/add" className="btn btn-primary mt-6">데이터 추가하러 가기 →</Link>
        </div>
    );

    const hasImpulse = impulse && (impulse.warnings.length > 0 || impulse.impulse_items.length > 0);

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <span className="badge badge-green">💡 AI 인사이트</span>
                    <h1 className="mt-2">절약 전략 & 충동 소비 탐지</h1>
                    <p className="mt-2">AI가 분석한 소비 패턴을 기반으로 맞춤 전략을 제안합니다.</p>
                </div>

                <div className={styles.grid}>
                    {/* AI 절약 전략 */}
                    <div className={`card ${styles.tipsCard}`}>
                        <div className={styles.tipsHeader}>
                            <span style={{ fontSize: "1.5rem" }}>🤖</span>
                            <h3>AI 절약 전략 추천</h3>
                        </div>
                        <div className={styles.tipsDivider} />
                        {tips.split("\n\n").filter(Boolean).map((tip, i) => (
                            <div key={i} className={styles.tipItem}>
                                <p className={styles.tipText}>{tip}</p>
                            </div>
                        ))}
                    </div>

                    {/* 충동 소비 탐지 */}
                    <div className="flex flex-col gap-4">
                        {/* 요약 뱃지 */}
                        {impulse && (
                            <div className={`card ${hasImpulse ? styles.impulseAlert : styles.impulseOk}`}>
                                <div className={styles.impulseTop}>
                                    <span style={{ fontSize: "2rem" }}>{hasImpulse ? "⚡" : "✅"}</span>
                                    <div>
                                        <h3>{hasImpulse ? "충동 소비 패턴 탐지됨" : "소비 패턴 양호"}</h3>
                                        {hasImpulse && (
                                            <p className="text-sm mt-1">
                                                관련 지출 예상 금액:{" "}
                                                <strong className={styles.redText}>
                                                    {impulse.total_impulse_amount.toLocaleString()}원
                                                </strong>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 경고 목록 */}
                        {impulse?.warnings.map((w, i) => (
                            <div key={i} className={`card ${styles.warningCard}`}>
                                <div className={styles.warningTop}>
                                    <span className="badge badge-orange">{w.type}</span>
                                    <span className={styles.warnCat}>{w.category}</span>
                                </div>
                                <p className="text-sm mt-2">{w.message}</p>
                                <p className={`text-sm mt-1 ${styles.warnAmt}`}>
                                    누적 금액: {w.amount.toLocaleString()}원
                                </p>
                            </div>
                        ))}

                        {/* 이상 지출 항목 */}
                        {impulse?.impulse_items && impulse.impulse_items.length > 0 && (
                            <div className="card">
                                <h3 className="mb-4">🔍 이상 지출 항목</h3>
                                {impulse.impulse_items.map((item, i) => (
                                    <div key={i} className={styles.impulseItem}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">{item.description}</span>
                                            <span className={styles.impAmt}>{item.amount.toLocaleString()}원</span>
                                        </div>
                                        <p className="text-sm text-muted mt-1">{item.reason}</p>
                                        {item.date && <p className="text-xs text-muted">{item.date}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasImpulse && (
                            <div className="card" style={{ textAlign: "center", padding: "32px" }}>
                                <p style={{ fontSize: "2rem" }}>🎉</p>
                                <h3 className="mt-4">훌륭한 소비 패턴!</h3>
                                <p className="text-sm text-muted mt-2">
                                    특별한 이상 소비 패턴이 발견되지 않았습니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.navBtns}>
                    <Link href="/" className="btn btn-secondary">← 대시보드</Link>
                    <Link href="/add" className="btn btn-primary">소비 내역 더 추가하기</Link>
                </div>
            </div>
        </div>
    );
}
