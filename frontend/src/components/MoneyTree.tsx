"use client";
import styles from "./MoneyTree.module.css";

interface MoneyTreeProps {
    level: number;
    levelName: string;
}

const TREE_ICONS = {
    1: "🌱", // 씨앗(새싹)
    2: "🌿", // 새싹(작은 풀)
    3: "🌳", // 어린 나무
    4: "🌲", // 큰 나무
    5: "🎄", // 황금 나무(화려한 나무)
};

export default function MoneyTree({ level, levelName }: MoneyTreeProps) {
    const icon = TREE_ICONS[level as keyof typeof TREE_ICONS] || "🌱";

    return (
        <div className={styles.container}>
            <div className={styles.treeWrapper}>
                <div className={`${styles.tree} ${styles[`level${level}`]}`}>
                    {icon}
                </div>
                <div className={styles.ground}></div>
            </div>
            <div className={styles.info}>
                <span className="badge badge-blue">LV.{level}</span>
                <h3 className={styles.levelName}>{levelName}</h3>
                <p className={styles.desc}>미션을 완료해서 나무를 더 크게 키워보세요!</p>
            </div>
        </div>
    );
}
