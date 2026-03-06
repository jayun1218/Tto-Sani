from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.expense import Mission, UserProgress

router = APIRouter(prefix="/gamification", tags=["gamification"])

class MissionOut(BaseModel):
    id: int
    title: str
    description: str
    point: int
    is_completed: int
    
    class Config:
        from_attributes = True

class ProgressOut(BaseModel):
    total_points: int
    level: int
    level_name: str

    class Config:
        from_attributes = True

LEVEL_NAMES = {
    1: "씨앗",
    2: "새싹",
    3: "어린 나무",
    4: "큰 나무",
    5: "황금 나무"
}

@router.get("/missions", response_model=List[MissionOut])
def get_daily_missions(db: Session = Depends(get_db)):
    today = datetime.now().date()
    missions = db.query(Mission).filter(Mission.date == today).all()
    
    # 미션이 없으면 기본 미션 생성
    if not missions:
        default_missions = [
            Mission(title="오늘 카페 가지 않기", description="커피 대신 텀블러를 사용해보세요!", point=15, date=today),
            Mission(title="무지출 챌린지", description="오늘 하루 지출 0원에 도전하세요!", point=30, date=today),
            Mission(title="편의점 유혹 이기기", description="편의점 대신 집밥을 먹어보세요!", point=20, date=today)
        ]
        db.add_all(default_missions)
        db.commit()
        missions = db.query(Mission).filter(Mission.date == today).all()
        
    return missions

@router.post("/missions/{mission_id}/complete")
def complete_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="미션을 찾을 수 없습니다.")
    
    if mission.is_completed:
        return {"message": "이미 완료된 미션입니다."}
    
    mission.is_completed = 1
    
    # 사용자 포인트 업데이트
    progress = db.query(UserProgress).first()
    if not progress:
        progress = UserProgress(total_points=0, level=1)
        db.add(progress)
    
    progress.total_points += mission.point
    
    # 레벨업 로직 (예: 100포인트당 레벨업)
    new_level = (progress.total_points // 100) + 1
    if new_level > 5: new_level = 5
    progress.level = new_level
    
    db.commit()
    db.refresh(progress)
    
    return {
        "message": "미션 완료!",
        "added_points": mission.point,
        "current_total": progress.total_points,
        "current_level": progress.level
    }

@router.get("/progress", response_model=ProgressOut)
def get_progress(db: Session = Depends(get_db)):
    progress = db.query(UserProgress).first()
    if not progress:
        progress = UserProgress(total_points=0, level=1)
        db.add(progress)
        db.commit()
        db.refresh(progress)
        
    return ProgressOut(
        total_points=progress.total_points,
        level=progress.level,
        level_name=LEVEL_NAMES.get(progress.level, "씨앗")
    )
