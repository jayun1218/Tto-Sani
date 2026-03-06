'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './page.module.css';

export default function AttendancePage() {
    const router = useRouter();
    const [streak, setStreak] = useState(0);
    const [history, setHistory] = useState<string[]>([]);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchData = async () => {
        try {
            const [progressRes, historyRes] = await Promise.all([
                axios.get(`${API_URL}/gamification/progress`),
                axios.get(`${API_URL}/gamification/attendance/history`)
            ]);

            setStreak(progressRes.data.attendance_streak);
            setHistory(historyRes.data);

            const today = new Date().toISOString().split('T')[0];
            if (historyRes.data.includes(today)) {
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
            setHistory(prev => [...prev, res.data.date]);
        } catch (error: any) {
            alert(error.response?.data?.detail || '출석체크에 실패했습니다.');
        }
    };

    // 캘린더 날짜 계산 로직
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const isChecked = (day: number | null) => {
        if (!day) return false;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return history.includes(dateStr);
    };

    const isToday = (day: number | null) => {
        if (!day) return false;
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    if (loading) return <div className={styles.container}>로딩 중...</div>;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push('/')}>
                    ←
                </button>
                <h1 className={styles.title}>{month + 1}월 출석체크</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <section className={styles.streakSection}>
                <div className={styles.streakCircle}>
                    <h2 className={styles.streakCount}>{streak}</h2>
                    <p className={styles.streakLabel}>일째 열정 중!</p>
                </div>
                <p className={styles.streakSubText}>연속 출석하면 보너스 포인트가 쏟아져요! 🎁</p>
            </section>

            <div className={styles.calendarContainer}>
                <div className={styles.weekdays}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                        <div key={d} className={styles.weekday}>{d}</div>
                    ))}
                </div>
                <div className={styles.calendarGrid}>
                    {days.map((day, i) => (
                        <div
                            key={i}
                            className={`${styles.calendarDay} ${day === null ? styles.empty : ''} ${isChecked(day) ? styles.checked : ''} ${isToday(day) ? styles.today : ''}`}
                        >
                            {day}
                            {isChecked(day) && (
                                <div className={styles.stamp}>
                                    <span className={styles.stampIcon}>💰</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.rewardInfo}>
                <div className={styles.rewardItem}>
                    <span className={styles.rewardTitle}>5일 달성</span>
                    <span className={styles.rewardValue}>+500P</span>
                </div>
                <div className={styles.rewardItem}>
                    <span className={styles.rewardTitle}>10일 달성</span>
                    <span className={styles.rewardValue}>+1,000P</span>
                </div>
                <div className={styles.rewardItem}>
                    <span className={styles.rewardTitle}>20일 달성</span>
                    <span className={styles.rewardValue}>+2,000P</span>
                </div>
                <div className={styles.rewardItem}>
                    <span className={styles.rewardTitle}>한달(30일)</span>
                    <span className={styles.rewardValue}>+3,000P</span>
                </div>
            </div>

            <button
                className={`${styles.checkButton} ${alreadyDone ? styles.done : ''}`}
                disabled={alreadyDone}
                onClick={handleCheck}
            >
                {alreadyDone ? '오늘 출석 완료!' : '오늘의 포인트 받기'}
            </button>
        </main>
    );
}
