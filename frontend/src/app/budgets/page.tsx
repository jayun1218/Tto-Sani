"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../page.module.css";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PREDEFINED_CATEGORIES = ["식당", "카페", "쇼핑", "교통", "배달", "의료/건강", "문화/여가", "구독", "기타"];

interface BudgetReport {
    category: string;
    budget_amount: number;
    spent_amount: number;
    remaining_amount: number;
    usage_ratio: number;
    status: string;
}

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<BudgetReport[]>([]);
    const [totalBudget, setTotalBudget] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    const fetchBudgets = async () => {
        try {
            const res = await axios.get(`${API}/analysis/budgets`);
            setBudgets(res.data);

            // 총 예산 가져오기 (category="TOTAL"로 저장된 값)
            const nativeRes = await axios.get(`${API}/native/summary`);
            setTotalBudget(nativeRes.data.total_budget || 0);
        } catch (err) {
            console.error("Failed to fetch budgets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSaveCategory = async (category: string, amount: string) => {
        setSaving(category);
        try {
            await axios.post(`${API}/analysis/budgets`, null, {
                params: { category, amount: parseFloat(amount) || 0 }
            });
            await fetchBudgets();
        } catch (err) {
            alert("예산 저장에 실패했습니다.");
        } finally {
            setSaving(null);
        }
    };

    // 지출 내역이 없어도 모든 카테고리를 보여주기 위해 병합
    const allCategoryBudgets = PREDEFINED_CATEGORIES.map(cat => {
        const existing = budgets.find(b => b.category === cat);
        return existing || {
            category: cat,
            budget_amount: 0,
            spent_amount: 0,
            remaining_amount: 0,
            usage_ratio: 0,
            status: "normal"
        };
    }).filter(b => b.category !== "TOTAL");

    const totalCategorySpent = budgets.reduce((sum, b) => b.category !== "TOTAL" ? sum + b.spent_amount : sum, 0);

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className={styles.header}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <span className="badge badge-purple">🎯 목표 세우기</span>
                        <h1 className="mt-4" style={{ fontSize: '2.5rem', fontWeight: 900 }}>한 달 자산 계획</h1>
                        <p className="text-muted mt-2">얼마만큼 쓰고 얼마큼 아낄지 나만의 목표를 정해보세요.</p>
                    </div>
                </div>

                <div className={styles.grid} style={{ gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '32px', alignItems: 'start' }}>
                    {/* 왼쪽: 총 예산 정보 요약 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className={styles.personaCard} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '40px' }}>
                            <div className={styles.personaBadge}>이번 달 총 지출 목표 (합계)</div>
                            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                                    {formatPrice(budgets.filter(b => b.category !== "TOTAL").reduce((sum, b) => sum + b.budget_amount, 0))}
                                </div>
                            </div>
                            <p style={{ marginTop: '24px', fontSize: '0.9rem', textAlign: 'center', opacity: 0.8 }}>
                                각 카테고리별 예산을 설정하면 자동으로 합산됩니다.
                            </p>
                        </div>

                        <div className="card" style={{ padding: '30px' }}>
                            <h4 style={{ marginBottom: '20px' }}>📊 현재 상태 요약</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-muted">설정된 총 예산</span>
                                    <span style={{ fontWeight: 700 }}>{formatPrice(budgets.filter(b => b.category !== "TOTAL").reduce((sum, b) => sum + b.budget_amount, 0))}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-muted">현재 총 지출</span>
                                    <span style={{ fontWeight: 700, color: '#ff5f5f' }}>{formatPrice(totalCategorySpent)}</span>
                                </div>
                                <div className={styles.tipsDivider} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                    <span style={{ fontWeight: 800 }}>남은 여유</span>
                                    <span style={{ fontWeight: 900, color: (budgets.filter(b => b.category !== "TOTAL").reduce((sum, b) => sum + b.budget_amount, 0) - totalCategorySpent) >= 0 ? 'var(--accent-green)' : '#ff5f5f' }}>
                                        {formatPrice(budgets.filter(b => b.category !== "TOTAL").reduce((sum, b) => sum + b.budget_amount, 0) - totalCategorySpent)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 카테고리별 세부 예산 */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 30px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>🛍️ 카테고리별 목표 설정</h3>
                        </div>
                        <div style={{ padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {allCategoryBudgets.map((b, idx) => (
                                <div key={idx} style={{ padding: '20px 0', borderBottom: idx === allCategoryBudgets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.category}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                                type="number"
                                                className="input"
                                                style={{ width: '120px', padding: '6px 12px', textAlign: 'right' }}
                                                placeholder="0"
                                                defaultValue={b.budget_amount || ""}
                                                onBlur={(e) => handleSaveCategory(b.category, e.target.value)}
                                            />
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>원</span>
                                        </div>
                                    </div>
                                    {b.budget_amount > 0 && (
                                        <div style={{ marginTop: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                                                <span className="text-muted">지출: {formatPrice(b.spent_amount)}</span>
                                                <span style={{ color: b.usage_ratio > 90 ? '#ff5f5f' : '#8896b3' }}>{b.usage_ratio}% 사용</span>
                                            </div>
                                            <div className={styles.bar} style={{ height: '6px', background: 'rgba(255,255,255,0.05)' }}>
                                                <div
                                                    className={styles.barFill}
                                                    style={{
                                                        width: `${Math.min(b.usage_ratio, 100)}%`,
                                                        background: b.usage_ratio > 100 ? '#ff5f5f' : b.usage_ratio > 80 ? '#fbbf24' : 'var(--accent-blue)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <Link href="/" className="btn btn-secondary">메인으로 돌아가기</Link>
                </div>
            </div>
        </div>
    );
}
