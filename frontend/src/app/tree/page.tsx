'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './page.module.css';
import MoneyTree from '@/components/MoneyTree';

interface UserProgress {
    total_points: number;
    level: number;
    level_name: string;
    current_exp: number;
    max_exp: number;
}

export default function TreePage() {
    const router = useRouter();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('무럭무럭 자라고 있어요!');
    const [subMessage, setSubMessage] = useState('오늘도 나무를 돌봐주세요');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchProgress = async () => {
        try {
            const res = await axios.get(`${API_URL}/gamification/progress`);
            setProgress(res.data);
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    const handleAction = async (type: 'water' | 'supplement') => {
        try {
            const res = await axios.post(`${API_URL}/gamification/${type}`);
            setMessage(type === 'water' ? '물을 주었습니다!' : '영양제 주기를 완료했어요!');
            setSubMessage('나무가 아주 기분 좋아 보여요!');
            await fetchProgress();
        } catch (error: any) {
            alert(error.response?.data?.detail || '요청 처리에 실패했습니다.');
        }
    };

    if (loading || !progress) return <div className={styles.container}>Loading...</div>;

    const progressPercent = Math.min(100, Math.floor((progress.current_exp / progress.max_exp) * 100));

    return (
        <main className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push('/')}>
                    ←
                </button>
            </header>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.mainTitle}>{message}</h1>
                <p className={styles.subTitle}>{subMessage}</p>
            </div>

            {/* Floating Buttons */}
            <div className={styles.floatingActions}>
                <div className={styles.floatingBtn} onClick={() => router.push('/missions')}>
                    <div className={styles.iconCircle}>🧪</div>
                    <span className={styles.btnLabel}>미션하기</span>
                </div>
            </div>

            {/* Tree Visualization Area */}
            <div className={styles.treeArea}>
                <div className={styles.islandWrapper}>
                    <MoneyTree level={progress.level} levelName={progress.level_name} />
                </div>
            </div>

            {/* Bottom Sheet */}
            <div className={styles.bottomSheet}>
                <div className={styles.progressHeader}>
                    <span className={styles.levelLabel}>레벨{progress.level} {progress.level_name}</span>
                    <span className={styles.percentage}>{progressPercent}%</span>
                </div>

                <div className={styles.progressBarContainer}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                <div className={styles.actionGrid}>
                    <div className={styles.actionCard} onClick={() => handleAction('supplement')}>
                        <div className={styles.actionInfo}>
                            <span className={styles.actionName}>영양제 주기</span>
                            <span className={styles.actionSub}>200P 소모</span>
                        </div>
                        <div className={styles.actionIcon}>💊</div>
                    </div>

                    <div className={styles.actionCard} onClick={() => handleAction('water')}>
                        <div className={styles.actionInfo}>
                            <span className={styles.actionName}>물 주기</span>
                            <span className={styles.actionSub}>50P 소모</span>
                        </div>
                        <div className={styles.actionIcon}>☁️</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
