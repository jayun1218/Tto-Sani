import Link from "next/link";
import styles from "./page.module.css";

const FEATURES = [
    {
        icon: "📊",
        title: "소비 자동 분류",
        desc: "AI가 카드 내역을 카페·배달·쇼핑 등으로 자동 분류합니다.",
        badge: "AI 기반",
        color: "--accent-blue",
    },
    {
        icon: "🔍",
        title: "패턴 분석",
        desc: "반복 소비, 카테고리별 지출 비율, 증가 추세를 분석합니다.",
        badge: "실시간",
        color: "--accent-purple",
    },
    {
        icon: "⚡",
        title: "충동 소비 탐지",
        desc: "이상 지출 패턴을 감지하고 알림을 제공합니다.",
        badge: "스마트 감지",
        color: "--accent-orange",
    },
    {
        icon: "💡",
        title: "절약 전략 추천",
        desc: "AI가 맞춤형 절약 전략과 구체적인 절감 금액을 제안합니다.",
        badge: "개인 맞춤",
        color: "--accent-green",
    },
];

const STEPS = [
    { step: "01", title: "CSV 업로드", desc: "카드 사용 내역 CSV 파일을 업로드합니다." },
    { step: "02", title: "AI 분석", desc: "AI가 소비 패턴을 자동으로 분류·분석합니다." },
    { step: "03", title: "인사이트 확인", desc: "대시보드에서 분석 결과와 절약 전략을 확인합니다." },
];

export default function HomePage() {
    return (
        <div className={styles.page}>
            {/* ── 히어로 ── */}
            <section className={styles.hero}>
                <div className={`container ${styles.heroInner}`}>
                    <div className={styles.heroBadge}>
                        <span className="badge badge-blue">✨ AI 소비 분석 서비스</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        <span className="gradient-text">또 사는 거야?</span>
                        <br />
                        이제 AI가 분석해드립니다
                    </h1>
                    <p className={styles.heroDesc}>
                        카드 내역 CSV를 업로드하면 AI가 소비 패턴을 분석하고<br />
                        충동 소비를 탐지해 맞춤형 절약 전략을 제안해드립니다.
                    </p>
                    <div className={styles.heroCTA}>
                        <Link href="/upload" className="btn btn-primary btn-lg">
                            무료로 시작하기 →
                        </Link>
                        <Link href="/dashboard" className="btn btn-secondary btn-lg">
                            데모 보기
                        </Link>
                    </div>
                    <div className={styles.heroStats}>
                        {[
                            { value: "8개", label: "소비 카테고리" },
                            { value: "즉시", label: "분석 결과 제공" },
                            { value: "100%", label: "프라이버시 보호" },
                        ].map(({ value, label }) => (
                            <div key={label} className={styles.statItem}>
                                <span className={styles.statValue}>{value}</span>
                                <span className={styles.statLabel}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 배경 장식 */}
                <div className={styles.bgGlow1} />
                <div className={styles.bgGlow2} />
            </section>

            {/* ── 기능 카드 ── */}
            <section className={`section ${styles.features}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>스마트한 소비 관리의 시작</h2>
                        <p>또사니가 제공하는 핵심 기능</p>
                    </div>
                    <div className="grid-2 mt-6">
                        {FEATURES.map(({ icon, title, desc, badge }) => (
                            <div key={title} className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "2rem" }}>{icon}</span>
                                    <span className="badge badge-blue">{badge}</span>
                                </div>
                                <h3>{title}</h3>
                                <p className="text-sm">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 사용 방법 ── */}
            <section className={`section ${styles.howto}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>3단계로 시작하세요</h2>
                        <p>복잡한 설정 없이 바로 분석을 시작할 수 있습니다</p>
                    </div>
                    <div className="grid-3 mt-6">
                        {STEPS.map(({ step, title, desc }) => (
                            <div key={step} className={`card ${styles.stepCard}`}>
                                <div className={styles.stepNum}>{step}</div>
                                <h3 className="mt-4">{title}</h3>
                                <p className="text-sm mt-2">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA 배너 ── */}
            <section className={`section ${styles.cta}`}>
                <div className="container">
                    <div className={styles.ctaCard}>
                        <h2>지금 바로 소비 패턴을 분석해보세요</h2>
                        <p className="mt-2">카드 내역 CSV 파일만 있으면 됩니다.</p>
                        <Link href="/upload" className="btn btn-primary btn-lg mt-6" style={{ display: "inline-flex" }}>
                            시작하기 →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
