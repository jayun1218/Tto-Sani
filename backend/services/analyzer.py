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

    return {
        "warnings": warnings,
        "impulse_items": impulse_items,
        "total_impulse_amount": round(total_impulse, 0),
    }


import calendar
from datetime import date

def predict_spending(current_expenses: List[Expense]) -> Dict[str, Any]:
    """현재까지의 소비 속도를 기반으로 이번 달 말 총 지출을 예측한다."""
    if not current_expenses:
        return {"predicted_total": 0, "status": "no_data"}

    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    elapsed_days = today.day

    current_total = sum(e.amount for e in current_expenses)
    daily_avg = current_total / elapsed_days
    predicted_total = daily_avg * days_in_month

    status = "normal"
    if predicted_total > 1000000: # 예시 기준: 100만원 초과 시 주의
        status = "warning"
    
    return {
        "current_total": round(current_total, 0),
        "predicted_total": round(predicted_total, 0),
        "days_remaining": days_in_month - elapsed_days,
        "daily_avg": round(daily_avg, 0),
        "status": status
    }


def watchdog_analysis(current_expenses: List[Expense], past_expenses: List[Expense]) -> List[Dict[str, Any]]:
    """과거 평균 대비 이번 달 급증한 카테고리를 탐지한다."""
    if not current_expenses or not past_expenses:
        return []

    # 과거 카테고리별 평균 (간단히 총액 / 3개월 가정)
    past_cat_total: Dict[str, float] = defaultdict(float)
    for exp in past_expenses:
        past_cat_total[exp.category] += exp.amount
    
    past_avg = {cat: amt / 3 for cat, amt in past_cat_total.items()}

    # 이번 달 카테고리별 지출
    current_cat_total: Dict[str, float] = defaultdict(float)
    for exp in current_expenses:
        current_cat_total[exp.category] += exp.amount

    alerts = []
    for cat, current_amt in current_cat_total.items():
        avg = past_avg.get(cat, 0)
        if avg > 0 and current_amt > avg * 1.5: # 50% 이상 증가 시
            alerts.append({
                "category": cat,
                "current_amount": round(current_amt, 0),
                "past_average": round(avg, 0),
                "increase_ratio": round((current_amt / avg - 1) * 100, 1),
                "message": f"{cat} 지출이 평소보다 {round((current_amt / avg - 1) * 100)}% 급증했습니다!"
            })
    
    return alerts


def detect_subscriptions(expenses: List[Expense]) -> List[Dict[str, Any]]:
    """반복되는 결제 내역을 분석하여 정기 구독을 탐지한다."""
    if not expenses:
        return []

    # 가맹점별 빈도 및 금액 분석
    desc_map = defaultdict(list)
    for exp in expenses:
        desc_map[exp.description].append(exp)

    subscriptions = []
    # 간단한 로직: 한 달 프로젝트 내에서 결제액이 1회더라도 
    # '네이버', '유튜브', '넷플릭스' 등 특정 키워드 포함 시 구독으로 간주 (V1)
    # 또는 여러 달 데이터를 볼 수 있다면 더 정확함. 우선 키워드 방식 결합.
    sub_keywords = ["네이버플러스", "유튜브", "넷플릭스", "쿠팡와우", "Spotify", "디즈니+", "구독", "멤버십"]
    
    for desc, exps in desc_map.items():
        is_sub = any(kw.lower() in desc.lower() for kw in sub_keywords)
        # 혹은 동일 금액 2회 이상 (같은 달 보다는 기간을 넓게 잡아야 함)
        
        if is_sub:
            total_amt = sum(e.amount for e in exps)
            subscriptions.append({
                "description": desc,
                "amount": round(total_amt / len(exps), 0), # 1회 결제액 기준
                "count": len(exps),
                "category": exps[0].category
            })

    return subscriptions


def compare_trends(current_expenses: List[Expense], past_month_expenses: List[Expense], past_year_expenses: List[Expense]) -> Dict[str, Any]:
    """전월 및 전년 동월 대비 지출 트렌드를 분석한다."""
    current_total = sum(e.amount for e in current_expenses)
    past_month_total = sum(e.amount for e in past_month_expenses)
    past_year_total = sum(e.amount for e in past_year_expenses)

    def get_diff(curr, past):
        if past == 0: return 0
        return round((curr / past - 1) * 100, 1)

    return {
        "current_total": round(current_total, 0),
        "past_month": {
            "total": round(past_month_total, 0),
            "diff_ratio": get_diff(current_total, past_month_total)
        },
        "past_year": {
            "total": round(past_year_total, 0),
            "diff_ratio": get_diff(current_total, past_year_total)
        }
    }


def analyze_budgets(current_expenses: List[Expense], budgets: List[Any]) -> List[Dict[str, Any]]:
    """카테고리별 예산 대비 지출 현황을 분석한다."""
    cat_expence = defaultdict(float)
    for exp in current_expenses:
        cat_expence[exp.category] += exp.amount
    
    budget_reports = []
    for b in budgets:
        spent = cat_expence.get(b.category, 0)
        remaining = b.amount - spent
        usage_ratio = (spent / b.amount * 100) if b.amount > 0 else 0
        
        status = "normal"
        if usage_ratio >= 100: status = "exceeded"
        elif usage_ratio >= 80: status = "danger"
        
        budget_reports.append({
            "category": b.category,
            "budget_amount": round(b.amount, 0),
            "spent_amount": round(spent, 0),
            "remaining_amount": round(remaining, 0),
            "usage_ratio": round(usage_ratio, 1),
            "status": status
        })
    
    return budget_reports
