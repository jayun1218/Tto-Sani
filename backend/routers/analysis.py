"""
소비 분석 API 라우터
- 카테고리별 요약
- 충동 소비 탐지
- AI 절약 전략 추천
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.expense import Expense, Budget
from services.analyzer import (
    analyze_summary, detect_impulse, predict_spending, 
    watchdog_analysis, detect_subscriptions,
    compare_trends, analyze_budgets
)
from services.ai_advisor import generate_tips

router = APIRouter(prefix="/analysis", tags=["analysis"])


from datetime import datetime, timedelta
from sqlalchemy import extract

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """이번 달의 카테고리별 소비 합계 및 전체 통계를 반환한다."""
    today = datetime.now()
    expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).all()
    return analyze_summary(expenses)


@router.get("/prediction")
def get_prediction(db: Session = Depends(get_db)):
    """이번 달 지출 예측 결과를 반환한다."""
    today = datetime.now()
    expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).all()
    return predict_spending(expenses)


@router.get("/watchdog")
def get_watchdog(db: Session = Depends(get_db)):
    """과거 평균 대비 급증한 소비를 탐지한다."""
    today = datetime.now()
    # 이번 달 데이터
    current_expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).all()
    
    # 과거 3개월 데이터 (간단히 90일 전부터 이번 달 전까지)
    three_months_ago = today.replace(day=1) - timedelta(days=90)
    past_expenses = db.query(Expense).filter(
        Expense.date >= three_months_ago.date(),
        Expense.date < today.replace(day=1).date()
    ).all()
    
    return watchdog_analysis(current_expenses, past_expenses)


@router.get("/subscriptions")
def get_subscriptions(db: Session = Depends(get_db)):
    """탐지된 정기 구독 내역을 반환한다."""
    # 구독 탐지는 데이터가 많을수록 정확하므로 최근 3개월치를 본다
    today = datetime.now()
    three_months_ago = today - timedelta(days=90)
    expenses = db.query(Expense).filter(
        Expense.date >= three_months_ago.date()
    ).all()
    return detect_subscriptions(expenses)


@router.get("/impulse")
def get_impulse(db: Session = Depends(get_db)):
    """이번 달의 충동 소비 패턴 탐지 결과를 반환한다."""
    today = datetime.now()
    expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).all()
    return detect_impulse(expenses)


@router.get("/tips")
def get_tips(db: Session = Depends(get_db)):
    """이번 달의 AI 기반 절약 전략 추천을 반환한다."""
    today = datetime.now()
    expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).all()
    summary = analyze_summary(expenses)
    tips = generate_tips(summary)
    return {"tips": tips, "summary": summary}
@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    """전월 및 전년 동월 대비 소비 트렌드 비교 결과를 반환한다."""
    today = datetime.now()
    # 이번 달 데이터
    current_expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).all()
    
    # 전월 데이터
    first_day_current = today.replace(day=1)
    last_day_past_month = first_day_current - timedelta(days=1)
    past_month_expenses = db.query(Expense).filter(
        extract('year', Expense.date) == last_day_past_month.year,
        extract('month', Expense.date) == last_day_past_month.month
    ).all()
    
    # 전년 동월 데이터
    past_year_expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year - 1,
        extract('month', Expense.date) == today.month
    ).all()
    
    return compare_trends(current_expenses, past_month_expenses, past_year_expenses)


@router.get("/budgets")
def get_budgets(db: Session = Depends(get_db)):
    """카테고리별 예산 현황 리포트를 반환한다."""
    today = datetime.now()
    current_expenses = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).all()
    
    budgets = db.query(Budget).all()
    return analyze_budgets(current_expenses, budgets)


@router.post("/budgets")
def set_budget(category: str, amount: float, db: Session = Depends(get_db)):
    """특정 카테고리의 예산을 설정하거나 업데이트한다."""
    budget = db.query(Budget).filter(Budget.category == category).first()
    if budget:
        budget.amount = amount
    else:
        budget = Budget(category=category, amount=amount)
        db.add(budget)
    db.commit()
    return {"status": "success", "category": category, "amount": amount}
