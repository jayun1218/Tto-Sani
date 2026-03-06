"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
    { href: "/", label: "메인화면" },
    { href: "/add", label: "소비내역 추가" },
    { href: "/subscriptions", label: "구독 관리" },
    { href: "/tree", label: "돈나무 키우기" },
    { href: "/missions", label: "오늘의 미션" },
    { href: "/attendance", label: "출석체크" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [points, setPoints] = useState<number | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchPoints = async () => {
        try {
            const res = await axios.get(`${API_URL}/gamification/progress`);
            setPoints(res.data.total_points);
        } catch (error) {
            console.error('Failed to fetch points:', error);
        }
    };

    useEffect(() => {
        fetchPoints();
        const interval = setInterval(fetchPoints, 5000); // 5초마다 갱신
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoEmoji}>💰</span>
                    <span className={styles.logoText}>
                        또<span className={styles.logoAccent}>사니</span>
                    </span>
                </Link>

                <ul className={styles.links}>
                    {NAV_LINKS.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className={`${styles.link} ${pathname === href ? styles.active : ""}`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className={styles.userSection}>
                    {points !== null && (
                        <div className={styles.pointBadge}>
                            <span className={styles.pointIcon}>⭐</span>
                            <span className={styles.pointValue}>{points.toLocaleString()}</span>
                            <span className={styles.pointUnit}>P</span>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
