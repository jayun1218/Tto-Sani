"""
Pandas 기반 소비 패턴 분석 및 충동 소비 탐지 서비스
"""

from typing import List, Dict, Any
from collections import defaultdict
from models.expense import Expense


def analyze_summary(expenses: List[Expense]) -> Dict[str, Any]:
    """카테고리별 지출 합계 및 총 지출 반환."""
    if not expenses:
        return {"total": 0, "by_category": [], "count": 0}

    category_totals: Dict[str, float] = defaultdict(float)
    total = 0.0

    for exp in expenses:
        category_totals[exp.category] += exp.amount
        total += exp.amount

    by_category = [
        {
            "category": cat,
            "amount": round(amt, 0),
            "ratio": round(amt / total * 100, 1) if total > 0 else 0,
        }
        for cat, amt in sorted(category_totals.items(), key=lambda x: -x[1])
    ]

    return {
        "total": round(total, 0),
        "count": len(expenses),
        "by_category": by_category,
    }


def detect_impulse(expenses: List[Expense]) -> Dict[str, Any]:
    """
    충동 소비 탐지:
    1. 동일 카테고리 반복 소비 (주간 3회 이상)
    2. 배달/카페 지출이 전체의 40% 초과
    3. 단일 지출 이상 금액 (평균의 2배 초과)
    """
    if not expenses:
        return {"impulse_items": [], "warnings": [], "total_impulse_amount": 0}

    impulse_items = []
    warnings = []

    # 1. 카테고리별 빈도 분석
    category_count: Dict[str, int] = defaultdict(int)
    category_amount: Dict[str, float] = defaultdict(float)
    total = sum(e.amount for e in expenses)

    for exp in expenses:
        category_count[exp.category] += 1
        category_amount[exp.category] += exp.amount

    # 2. 반복 소비 경고 (카테고리 5회 이상)
    for cat, count in category_count.items():
        if count >= 5:
            warnings.append({
                "type": "반복소비",
                "category": cat,
                "message": f"{cat} 카테고리에서 {count}번의 반복 소비가 탐지되었습니다.",
                "amount": round(category_amount[cat], 0),
            })

    # 3. 카페/배달이 전체의 40% 초과
    impulse_cats = ["카페", "배달"]
    impulse_total = sum(category_amount.get(c, 0) for c in impulse_cats)
    if total > 0 and impulse_total / total > 0.4:
        warnings.append({
            "type": "과소비경고",
            "category": "카페/배달",
            "message": f"카페/배달 지출이 전체 소비의 {round(impulse_total/total*100,1)}%입니다. 절약이 필요합니다.",
            "amount": round(impulse_total, 0),
        })

    # 4. 단일 이상 금액 탐지 (평균의 2.5배 초과)
    avg_amount = total / len(expenses)
    for exp in expenses:
        if exp.amount > avg_amount * 2.5:
            impulse_items.append({
                "description": exp.description,
                "amount": round(exp.amount, 0),
                "category": exp.category,
                "date": str(exp.date) if exp.date else None,
                "reason": f"평균 지출({round(avg_amount,0)}원)의 {round(exp.amount/avg_amount,1)}배 지출",
            })

    total_impulse = sum(i["amount"] for i in impulse_items) + sum(
        w["amount"] for w in warnings
    )

    return {
        "warnings": warnings,
        "impulse_items": impulse_items,
        "total_impulse_amount": round(total_impulse, 0),
    }
