from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.expense import Expense, UserProgress
from sqlalchemy import extract
from datetime import datetime
from typing import Dict, Any

router = APIRouter(prefix="/native", tags=["native"])

@router.get("/summary")
def get_native_summary(db: Session = Depends(get_db)):
    """iOS 위젯 및 애플워치용 경량 데이터 요약 반환."""
    today = datetime.now()
    
    # 이번 달 총 지출
    total_spending = db.query(Expense).filter(
        extract('year', Expense.date) == today.year,
        extract('month', Expense.date) == today.month
    ).with_entities(Expense.amount).all()
    total = sum(s[0] for s in total_spending)
    
    # 사용자 포인트 및 레벨
    progress = db.query(UserProgress).first()
    points = progress.total_points if progress else 0
    
    return {
        "monthly_total": int(total),
        "total_points": points,
        "month": today.month,
        "update_at": today.isoformat()
    }

@router.post("/location-trigger")
def handle_location_trigger(lat: float, lng: float, db: Session = Depends(get_db)):
    """특정 위치(상권) 진입 시 미션을 제안하거나 경고를 보낸다."""
    # 시뮬레이션: 특정 위경도 근처면 카페 지출 유혹 주의 알림
    # 실제로는 POI(Point of Interest) 데이터베이스 연동 필요
    
    # 예시: 스타벅스 좌표 근처라고 가정
    is_near_cafe = True 
    
    if is_near_cafe:
        return {
            "trigger": True,
            "title": "☕ 카페 유혹 주의!",
            "message": "주변에 카페가 있네요. 텀블러 할인 미션에 도전해볼까요?",
            "action": "view_missions"
        }
    
    return {"trigger": False}
