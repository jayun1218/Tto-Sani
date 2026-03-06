'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../page.module.css';

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    useEffect(() => {
        const fetchSubs = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analysis/subscriptions`);
                setSubs(res.data);
            } catch (error) {
                console.error("구독 내역 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubs();
    }, []);

    const totalMonthly = subs.reduce((acc, sub) => acc + sub.amount, 0);

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1>정기 구독 관리</h1>
                </div>

                <div className={styles.v2ReportSection}>
                    <div className={styles.predictionCard} style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(79, 142, 247, 0.2) 100%)' }}>
                        <div className={styles.predictInfo}>
                            <h3>한 달 정기 지출 합계</h3>
                            <div className={styles.predictValue}>{formatPrice(totalMonthly)}</div>
                            <div className={styles.predictStatus} style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)' }}>
                                {subs.length}개의 정기 구독 서비스가 탐지되었습니다.
                            </div>
                        </div>
                        <div className={styles.avatarWrap}>
                            <span style={{ fontSize: '4rem' }}>🍱</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.center}>
                        <div className="spinner" />
                        <p className="mt-4">구독 내역을 분석 중입니다...</p>
                    </div>
                ) : subs.length > 0 ? (
                    <div className={styles.subGrid}>
                        {subs.map((sub, idx) => (
                            <div key={idx} className={styles.subCard}>
                                <div className={styles.subHeader}>
                                    <div className={styles.subIcon}>
                                        {sub.description.includes('넷플릭스') ? '🎬' :
                                            sub.description.includes('유튜브') ? '📺' :
                                                sub.description.includes('네이버') ? '💚' :
                                                    sub.description.includes('쿠팡') ? '📦' : '💳'}
                                    </div>
                                    <div className={styles.subTitle}>
                                        <h4>{sub.description}</h4>
                                        <span className={styles.subCategory}>{sub.category}</span>
                                    </div>
                                </div>
                                <div className={styles.subPrice}>
                                    {formatPrice(sub.amount)}
                                </div>
                                <div className={styles.subFooter}>
                                    <span className={styles.subBadge}>정기 결제</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>매달 결제됨</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.center}>
                        <p style={{ fontSize: '3rem' }}>📂</p>
                        <h3>탐지된 정기 구독 내역이 없습니다.</h3>
                        <p className="text-muted">꾸준히 지출을 기록하면 AI가 구독을 찾아드릴게요!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
