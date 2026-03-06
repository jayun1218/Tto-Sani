"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
    { href: "/", label: "홈" },
    { href: "/upload", label: "데이터 업로드" },
    { href: "/dashboard", label: "소비 분석" },
    { href: "/insights", label: "절약 전략" },
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

                <Link href="/upload" className="btn btn-primary" style={{ fontSize: "0.875rem", padding: "10px 20px" }}>
                    시작하기 →
                </Link>
            </div>
        </nav>
    );
}
