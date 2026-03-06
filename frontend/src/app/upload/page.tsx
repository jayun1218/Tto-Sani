"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function UploadPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ saved: number; skipped: number } | null>(null);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFile = (f: File) => {
        if (!f.name.endsWith(".csv")) {
            setError("CSV 파일(.csv)만 업로드 가능합니다.");
            return;
        }
        setFile(f);
        setError("");
        setResult(null);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    const onUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError("");
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await axios.post(`${API}/expenses/upload`, form);
            setResult(res.data);
        } catch (e: any) {
            setError(e.response?.data?.detail ?? "업로드 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <span className="badge badge-blue">📂 데이터 업로드</span>
                    <h1 className="mt-4">소비 내역을 업로드하세요</h1>
                    <p className="mt-2">카드 CSV 파일을 업로드하면 AI가 자동으로 분류·분석합니다.</p>
                </div>

                <div className={styles.grid}>
                    {/* 업로드 영역 */}
                    <div className="card">
                        <div
                            className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${file ? styles.hasFile : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".csv"
                                onChange={onInputChange}
                                style={{ display: "none" }}
                            />
                            {file ? (
                                <>
                                    <div className={styles.fileIcon}>📄</div>
                                    <p className={styles.fileName}>{file.name}</p>
                                    <p className="text-sm text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                                </>
                            ) : (
                                <>
                                    <div className={styles.uploadIcon}>☁️</div>
                                    <p className={styles.uploadTitle}>파일을 드래그하거나 클릭하세요</p>
                                    <p className="text-sm text-muted mt-2">CSV 파일만 지원합니다</p>
                                </>
                            )}
                        </div>

                        {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

                        <button
                            className={`btn btn-primary w-full mt-4 ${styles.uploadBtn}`}
                            onClick={onUpload}
                            disabled={!file || loading}
                        >
                            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> 분석 중...</> : "분석 시작하기 →"}
                        </button>

                        {result && (
                            <div className={styles.resultBox}>
                                <p className={styles.resultTitle}>✅ 업로드 완료!</p>
                                <p className="text-sm mt-2">
                                    <strong>{result.saved}건</strong> 저장 · {result.skipped}건 건너뜀
                                </p>
                                <button
                                    className="btn btn-primary mt-4"
                                    onClick={() => router.push("/dashboard")}
                                >
                                    대시보드 바로가기 →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 안내 패널 */}
                    <div className="card">
                        <h3>📋 CSV 형식 안내</h3>
                        <p className="text-sm mt-2">아래 형식의 CSV 파일을 준비해주세요.</p>
                        <div className={styles.codeBlock}>
                            {`날짜,가맹점명,금액\n2024-01-15,스타벅스,6500\n2024-01-16,배달의민족,25000\n2024-01-17,쿠팡이츠,18000`}
                        </div>
                        <div className={styles.tips}>
                            <h4 className="mb-4">💡 지원 형식</h4>
                            {[
                                ["날짜", "YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD"],
                                ["금액", "숫자 (쉼표, 원 기호 자동 제거)"],
                                ["인코딩", "UTF-8 또는 EUC-KR"],
                            ].map(([k, v]) => (
                                <div key={k} className={styles.tipRow}>
                                    <span className="badge badge-blue">{k}</span>
                                    <span className={styles.tipVal}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
