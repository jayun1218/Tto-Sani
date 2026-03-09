"use client";
import { useState, useEffect } from "react";
import styles from "./LocationWarning.module.css";

// 감시할 주요 상권 좌표 (예시: 강남역, 성수 카페거리 등)
const DANGER_ZONES = [
    { name: "스타벅스 거리 (위험!)", lat: 37.50, lng: 127.02, radius: 0.5, message: "아니, 스타벅스가 근처에 있잖아?! ☕ 참아야 해!" },
    { name: "지름신 백화점", lat: 37.56, lng: 126.98, radius: 0.3, message: "백화점에 발을 들이는 순간... 알지? 부엉이가 지켜보고 있어! 🦉" },
    { name: "핫플레이스 성수", lat: 37.54, lng: 127.05, radius: 0.8, message: "여기는 예쁜 게 너무 많아... 지갑을 가방 깊이 넣으렴! 🦊" }
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function LocationWarning({ personaName, personaMessage }: { personaName?: string, personaMessage?: string }) {
    const [warning, setWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watcher = navigator.geolocation.watchPosition((pos) => {
            const { latitude, longitude } = pos.coords;

            for (const zone of DANGER_ZONES) {
                const dist = getDistance(latitude, longitude, zone.lat, zone.lng);
                if (dist <= zone.radius) {
                    setWarning(zone.message);
                    return;
                }
            }
            setWarning(null);
        }, (err) => console.error(err), { enableHighAccuracy: true });

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    if (!warning) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.emoji}>🚨</div>
                <h3>{personaName || "또사니"}의 긴급 경고!</h3>
                <p className={styles.message}>"{warning}"</p>
                <p className={styles.subtext}>예산이 평소보다 빠르게 소진되고 있어요.</p>
                <button className={styles.closeBtn} onClick={() => setWarning(null)}>알았어, 참을게!</button>
            </div>
        </div>
    );
}
