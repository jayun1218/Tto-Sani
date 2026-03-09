"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

const NAV_ITEMS = [
    { href: "/", label: "홈", icon: "🏠" },
    { href: "/tree", label: "돈나무", icon: "🌳" },
    { href: "/add", label: "추가", icon: "➕", isCenter: true },
    { href: "/missions", label: "미션", icon: "🎯" },
    { href: "/attendance", label: "출석", icon: "📅" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                {NAV_ITEMS.map(({ href, label, icon, isCenter }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.item} ${pathname === href ? styles.active : ""} ${isCenter ? styles.centerItem : ""}`}
                    >
                        <span className={styles.icon}>{icon}</span>
                        <span className={styles.label}>{label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
