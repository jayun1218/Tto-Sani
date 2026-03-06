'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './page.module.css';

export default function AttendancePage() {
    const router = useRouter();
    const [streak, setStreak] = useState(0);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_URL}/gamification/progress`);
            setStreak(res.data.attendance_streak);

            // Check if today is already done (mocking check or via API)
            const attendanceRes = await axios.post(`${API_URL}/gamification/attendance`);
            if (attendanceRes.data.already_done) {
                setAlreadyDone(true);
            }
        } catch (error) {
            console.error('Attendance status fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCheck = async () => {
        try {
            const res = await axios.post(`${API_URL}/gamification/attendance`);
            alert(res.data.message);
            setAlreadyDone(true);
            setStreak(res.data.streak);
        } catch (error) {
            console.error('Attendance check failed:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push('/')}>
                    ←
                </button>
                <h1 className={styles.title}>출석체크</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <section className={styles.streakSection}>
                <h2 className={styles.streakCount}>{streak}</h2>
                <p className={styles.streakLabel}>일 연속 출석 중!</p>
            </section>

            <div className={styles.attendanceGrid}>
                {[...Array(30)].map((_, i) => (
                    <div key={i} className={`${styles.dayItem} ${i < streak ? styles.checked : ''}`}>
                        <span>{i + 1}</span>
                        {i < streak && <span className={styles.checkIcon}>✅</span>}
                    </div>
                ))}
            </div>

            <div className={styles.bonusInfo}>
                <span className={styles.bonusTitle}>🎁 연속 출석 보너스</span>
                <ul className={styles.bonusList}>
                    <li>5일 연속: +500P</li>
                    <li>10일 연속: +1,000P</li>
                    <li>30일 연속: +3,000P</li>
                </ul>
            </div>

            <button
                className={styles.checkButton}
                disabled={alreadyDone}
                onClick={handleCheck}
            >
                {alreadyDone ? '출석 완료!' : '오늘의 포인트 받기'}
            </button>
        </main>
    );
}
