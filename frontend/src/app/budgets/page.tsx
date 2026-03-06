"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../page.module.css";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    const fetchBudgets = async () => {
        try {
            const res = await axios.get(`${API}/analysis/budgets`);
            setBudgets(res.data);
        } catch (err) {
            console.error("Failed to fetch budgets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSave = async (category: string) => {
        try {
            await axios.post(`${API}/analysis/budgets`, null, {
                params: { category, amount: parseFloat(inputValue) }
            });
            setEditMode(null);
            fetchBudgets();
        } catch (err) {
            alert("예산 저장에 실패했습니다.");
        }
    };

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className={styles.header}>
                    <div>
                        <span className="badge badge-purple">🎯 목표 관리</span>
                        <h1 className="mt-2">카테고리별 예산 설정</h1>
                        <p className="text-muted">효율적인 지출을 위해 카테고리별 목표를 정해보세요.</p>
                    </div>
                </div>

                <div className={styles.v2ReportSection} style={{ marginTop: '32px' }}>
                    {loading ? (
                        <div className={styles.center}><div className="spinner" /></div>
                    ) : budgets.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {budgets.map((b, idx) => (
                                <div key={idx} className={styles.miniStatCard} style={{ padding: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>📊</span>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{b.category}</h3>
                                        </div>
                                        {editMode === b.category ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    style={{ width: '120px', padding: '4px 12px' }}
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                />
                                                <button className="btn btn-primary" onClick={() => handleSave(b.category)}>저장</button>
                                                <button className="btn btn-outline" onClick={() => setEditMode(null)}>취소</button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-outline"
                                                style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                                                onClick={() => {
                                                    setEditMode(b.category);
                                                    setInputValue(b.budget_amount.toString());
                                                }}
                                            >
                                                수정하기
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span className="text-muted">지출 현황: {formatPrice(b.spent_amount)}</span>
                                        <span style={{ fontWeight: 700, color: b.status === 'exceeded' ? '#ff5f5f' : b.status === 'danger' ? '#fbbf24' : '#10d9a0' }}>
                                            {b.usage_ratio}% 사용
                                        </span>
                                    </div>

                                    <div className={styles.bar} style={{ height: '12px', background: 'rgba(255,255,255,0.1)' }}>
                                        <div
                                            className={styles.barFill}
                                            style={{
                                                width: `${Math.min(b.usage_ratio, 100)}%`,
                                                background: b.status === 'exceeded' ? '#ff5f5f' : b.status === 'danger' ? '#fbbf24' : '#10d9a0',
                                                boxShadow: b.status === 'normal' ? 'none' : `0 0 15px ${b.status === 'exceeded' ? '#ff5f5f' : '#fbbf24'}`
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>총 예산: {formatPrice(b.budget_amount)}</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                            {b.remaining_amount >= 0 ?
                                                `잔액: ${formatPrice(b.remaining_amount)}` :
                                                `초과: ${formatPrice(Math.abs(b.remaining_amount))}`
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.center}>
                            <p style={{ fontSize: '3rem' }}>🎯</p>
                            <h3>설정된 예산이 없습니다.</h3>
                            <p className="text-muted">가계부 데이터를 기반으로 예산을 설정해 보세요!</p>
                            <Link href="/add" className="btn btn-primary mt-4">데이터 추가하러 가기</Link>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(79, 142, 247, 0.05)', borderRadius: '24px', border: '1px dashed var(--accent-blue)' }}>
                    <h4 style={{ marginBottom: '8px' }}>💡 Tip</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        카테고리별 지출 내역이 있는 경우 위에 목록이 나타납니다. <br />
                        목표 예산을 설정하면 지출 시 실시간으로 잔액을 알람으로 보내드릴 수 있습니다!
                    </p>
                </div>
            </div>
        </div>
    );
}
