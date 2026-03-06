"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./MissionCard.module.css";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Mission {
    id: number;
    title: string;
    description: string;
    point: number;
    is_completed: number;
}

interface MissionCardProps {
    onProgressUpdate: () => void;
}

export default function MissionCard({ onProgressUpdate }: MissionCardProps) {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMissions = async () => {
        try {
            const res = await axios.get(`${API}/gamification/missions`);
            setMissions(res.data);
        } catch (err) {
            console.error("미션 로딩 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const completeMission = async (id: number) => {
        try {
            await axios.post(`${API}/gamification/missions/${id}/complete`);
            setMissions(missions.map(m => m.id === id ? { ...m, is_completed: 1 } : m));
            onProgressUpdate();
        } catch (err) {
            alert("미션 완료 처리에 실패했습니다.");
        }
    };

    if (loading) return <div className={styles.loading}>미션을 불러오는 중...</div>;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>오늘의 미션 🎯</h3>
            <div className={styles.list}>
                {missions.map((m) => (
                    <div key={m.id} className={`${styles.item} ${m.is_completed ? styles.completed : ""}`}>
                        <div className={styles.info}>
                            <span className={styles.mTitle}>{m.title}</span>
                            <p className={styles.mDesc}>{m.description}</p>
                        </div>
                        <button
                            className={styles.pBadge}
                            onClick={() => !m.is_completed && completeMission(m.id)}
                            disabled={m.is_completed === 1}
                        >
                            {m.is_completed ? "완료됨" : `+${m.point}p`}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
