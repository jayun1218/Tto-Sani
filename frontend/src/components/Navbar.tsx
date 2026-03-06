"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
    { href: "/", label: "메인화면" },
    { href: "/add", label: "소비내역 추가" },
    { href: "/tree", label: "돈나무 키우기" },
    { href: "/missions", label: "오늘의 미션" },
    { href: "/attendance", label: "출석체크" },
];

export default function Navbar() {
    const pathname = usePathname();

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
            </div>
        </nav>
    );
}
