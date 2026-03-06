"use client";
import styles from "./MoneyTree.module.css";
import Image from "next/image";

interface MoneyTreeProps {
    level: number;
    levelName: string;
}

export default function MoneyTree({ level, levelName }: MoneyTreeProps) {
    // 50레벨 시스템을 10개 스테이지 이미지로 매핑 (1-5:1, 6-10:2, ..., 46-50:10)
    const stage = Math.min(10, Math.floor((level - 1) / 5) + 1);
    const imagePath = `/trees/stage${stage}_v5.png?v=5`;

    return (
        <div className={styles.container}>
            <div className={styles.treeWrapper}>
                <div className={styles.imageContainer}>
                    <Image
                        src={imagePath}
                        alt={levelName}
                        width={300}
                        height={300}
                        className={styles.treeImage}
                        priority
                    />
                </div>
                <div className={styles.islandShadow}></div>
            </div>
            <div className={styles.info}>
                <div className={styles.levelBadge}>LV.{level}</div>
                <h3 className={styles.levelName}>{levelName}</h3>
                <p className={styles.desc}>정성을 다해 돌볼수록 더 넓은 세상으로 나아갑니다.</p>
            </div>
        </div>
    );
}
