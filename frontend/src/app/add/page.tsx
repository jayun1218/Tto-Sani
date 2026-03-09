"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CATEGORIES = ["식당", "카페", "쇼핑", "교통", "배달", "의료/건강", "문화/여가", "구독", "기타"];

export default function AddExpensePage() {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("식당");
    const [emotion, setEmotion] = useState("neutral");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const router = useRouter();

    const EMOTIONS = [
        { id: "happy", emoji: "😊", label: "행복" },
        { id: "neutral", emoji: "😐", label: "평범" },
        { id: "sad", emoji: "😢", label: "우울" },
        { id: "angry", emoji: "😡", label: "분노" },
        { id: "surprise", emoji: "😲", label: "충동" }
    ];

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        setLoading(true);
        try {
            await axios.post(`${API}/expenses/`, {
                description,
                amount: parseFloat(amount.replace(/,/g, "")),
                category,
                emotion,
                date,
            });
            router.push("/dashboard");
        } catch (err) {
            alert("저장에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOcrLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${API}/expenses/ocr`, formData);
            const data = res.data;
            setDescription(data.description);
            setAmount(data.amount.toLocaleString());
            setCategory(data.category);
            if (data.date) setDate(data.date);
            alert("영수증 분석 완료!");
        } catch (err) {
            alert("영수증 분석에 실패했습니다.");
        } finally {
            setOcrLoading(false);
        }
    };

    const handleAmountChange = (val: string) => {
        const num = val.replace(/[^0-9]/g, "");
        setAmount(num ? parseInt(num).toLocaleString() : "");
    };

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: "500px", paddingTop: "40px" }}>
                <div className={styles.header}>
                    <h2>소비 내역 추가</h2>
                    <p>오늘의 지출을 기록하고 나무를 키워보세요! 🌱</p>
                </div>

                <div className={styles.ocrContainer}>
                    <label className={styles.ocrBtn}>
                        <input type="file" accept="image/*" onChange={handleOCR} hidden disabled={ocrLoading} />
                        <span style={{ fontSize: "1.5rem" }}>{ocrLoading ? "⌛" : "📸"}</span>
                        <span>{ocrLoading ? "영수증 분석 중..." : "영수증 스캔하여 자동 입력"}</span>
                    </label>
                </div>

                <form onSubmit={onSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>금액</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            className={styles.amountInput}
                            placeholder="0"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            required
                        />
                        <span className={styles.currency}>원</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>내용</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="어디에 쓰셨나요? (예: 스타벅스)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>카테고리</label>
                        <div className={styles.categoryGrid}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`${styles.catBtn} ${category === cat ? styles.activeCat : ""}`}
                                    onClick={() => setCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>당시 나의 기분은?</label>
                        <div className={styles.emotionGrid}>
                            {EMOTIONS.map((emo) => (
                                <button
                                    key={emo.id}
                                    type="button"
                                    className={`${styles.emotionBtn} ${emotion === emo.id ? styles.activeEmotion : ""}`}
                                    onClick={() => setEmotion(emo.id)}
                                >
                                    {emo.emoji}
                                    <span>{emo.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>날짜</label>
                        <input
                            type="date"
                            className="input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full btn-lg mt-8" disabled={loading || ocrLoading}>
                        {loading ? "저장 중..." : "기록하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}
