'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from "@/lib/constants";
import styles from './page.module.css';
// import MoneyTree removed

interface Mission {
    id: number;
    title: string;
    description: string;
    points: number;
    is_completed: boolean;
    category: string;
}

const MISSION_ICONS: { [key: string]: string } = {
    '식비': '🍎',
    '교통': '🚌',
    '카페': '☕',
    '출석': '📅',
    '걸음': '👟',
    '건강': '💊'
};

export default function MissionsPage() {
    const router = useRouter();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [points, setPoints] = useState(0);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(true);


    const fetchData = async () => {
        try {
            const [missionsRes, progressRes] = await Promise.all([
                axios.get(`${API_URL}/gamification/missions`),
                axios.get(`${API_URL}/gamification/progress`)
            ]);
            setMissions(missionsRes.data);
            setPoints(progressRes.data.total_points);
            setLevel(progressRes.data.level);
        } catch (error) {
            console.error('Data loading failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleComplete = async (missionId: number) => {
        try {
            await axios.post(`${API_URL}/gamification/missions/${missionId}/complete`);
            fetchData(); // Refresh data after completion
        } catch (error) {
            console.error('Mission completion failed:', error);
            alert('미션 완료 처리에 실패했습니다.');
        }
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <main className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    ←
                </button>
                <div className={styles.pointBadge}>
                    P {(points || 0).toLocaleString()}P
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div className={styles.island}></div>
                    <div className={styles.walker}>🏃</div>
                </div>

                <div className={styles.stepDisplay}>
                    <p className={styles.stepCount}>38</p>
                    <p className={styles.stepLabel}>걸음</p>
                </div>
            </section>

            {/* Mission Sheet */}
            <section className={styles.missionSheet}>
                <h2 className={styles.sheetTitle}>오늘의 미션</h2>

                <div className={styles.missionGrid}>
                    {missions.map((mission) => (
                        <div key={mission.id} className={styles.missionItem}>
                            <div className={styles.iconWrapper}>
                                {MISSION_ICONS[mission.category] || '🎯'}
                            </div>
                            <p className={styles.missionTitle}>{mission.title}</p>
                            <button
                                className={`${styles.rewardButton} ${mission.is_completed ? styles.completedButton : ''}`}
                                onClick={() => !mission.is_completed && handleComplete(mission.id)}
                                disabled={mission.is_completed}
                            >
                                {mission.is_completed ? '완료됨' : `${mission.points.toLocaleString()}P 받기`}
                            </button>
                        </div>
                    ))}

                    {/* Default items if missions are less than 4 for UI demo */}
                    {missions.length === 0 && (
                        <>
                            <div className={styles.missionItem}>
                                <div className={styles.iconWrapper}>🍎</div>
                                <p className={styles.missionTitle}>식비 아끼기</p>
                                <button className={styles.rewardButton}>1,000P 받기</button>
                            </div>
                            <div className={styles.missionItem}>
                                <div className={styles.iconWrapper}>🚌</div>
                                <p className={styles.missionTitle}>걷거나 대중교통 이용</p>
                                <button className={styles.rewardButton}>1,500P 받기</button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
