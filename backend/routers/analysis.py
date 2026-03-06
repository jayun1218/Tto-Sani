"""
소비 분석 API 라우터
- 카테고리별 요약
- 충동 소비 탐지
- AI 절약 전략 추천
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.expense import Expense
from services.analyzer import analyze_summary, detect_impulse
from services.ai_advisor import generate_tips

router = APIRouter(prefix="/analysis", tags=["analysis"])


from datetime import datetime
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
