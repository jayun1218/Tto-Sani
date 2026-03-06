from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.expense import Mission, UserProgress, AttendanceRecord

router = APIRouter(prefix="/gamification", tags=["gamification"])

class MissionOut(BaseModel):
    id: int
    title: str
    description: str
    points: int
    is_completed: int
    
    class Config:
        from_attributes = True

class ProgressOut(BaseModel):
    total_points: int
    level: int
    level_name: str
    current_exp: int
    max_exp: int
    attendance_streak: int

    class Config:
        from_attributes = True

LEVEL_NAMES = {
    1: "씨앗", 6: "새싹", 11: "잎새", 16: "가지", 21: "꽃", 
    26: "열매", 31: "나무", 36: "숲", 41: "지구", 46: "우주"
}

LEVEL_MAX_EXP = {i: 50 + (i * 10) for i in range(1, 51)}
LEVEL_MAX_EXP[50] = 999999

WATER_EXP = 10
WATER_COST = 50
SUPPLEMENT_EXP = 50
SUPPLEMENT_COST = 200

@router.get("/missions", response_model=List[MissionOut])
def get_daily_missions(db: Session = Depends(get_db)):
    today = datetime.now().date()
    missions = db.query(Mission).filter(Mission.date == today).all()
    
    # 미션이 없으면 기본 미션 생성
    if not missions:
        default_missions = [
            Mission(title="오늘 카페 가지 않기", description="커피 대신 텀블러를 사용해보세요!", points=15, date=today),
            Mission(title="무지출 챌린지", description="오늘 하루 지출 0원에 도전하세요!", points=30, date=today),
            Mission(title="편의점 유혹 이기기", description="편의점 대신 집밥을 먹어보세요!", points=20, date=today)
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
    
    progress.total_points += mission.points
    
    # 미션 완료 시 경험치도 소폭 상승 (예: 포인트의 20%)
    progress.current_exp += int(mission.points * 0.2)
    
    # 레벨업 체크
    while progress.level < 50 and progress.current_exp >= LEVEL_MAX_EXP[progress.level]:
        progress.current_exp -= LEVEL_MAX_EXP[progress.level]
        progress.level += 1
    
    db.commit()
    db.refresh(progress)
    
    return {
        "message": "미션 완료!",
        "added_points": mission.points,
        "current_total": progress.total_points,
        "current_level": progress.level,
        "current_exp": progress.current_exp
    }

@router.get("/attendance/history")
def get_attendance_history(db: Session = Depends(get_db)):
    from models.expense import AttendanceRecord
    # 현재 달의 기록만 가져옴
    today = datetime.now().date()
    first_day = today.replace(day=1)
    records = db.query(AttendanceRecord).filter(AttendanceRecord.date >= first_day).all()
    return [r.date.isoformat() for r in records]

@router.post("/attendance")
def check_attendance(db: Session = Depends(get_db)):
    from models.expense import AttendanceRecord
    progress = db.query(UserProgress).first()
    if not progress:
        progress = UserProgress(total_points=0, level=1)
        db.add(progress)
    
    today = datetime.now().date()
    # 이미 오늘 기록이 있는지 확인
    existing_record = db.query(AttendanceRecord).filter(AttendanceRecord.date == today).first()
    if existing_record:
        return {"message": "이미 오늘 출석체크를 완료했습니다.", "already_done": True}
    
    # 연속 출석 확인
    if progress.last_attendance_date:
        from datetime import timedelta
        yesterday = today - timedelta(days=1)
        if progress.last_attendance_date == yesterday:
            progress.attendance_streak += 1
        else:
            progress.attendance_streak = 1
    else:
        progress.attendance_streak = 1
    
    progress.last_attendance_date = today
    
    # 기본 포인트 보상
    reward = 100
    message = "출석체크 완료! 100P를 획득했습니다."
    
    # 연속 출석 보상
    streak = progress.attendance_streak
    if streak == 5:
        reward += 500
        message += " (5일 연속 보너스 +500P!)"
    elif streak == 10:
        reward += 1000
        message += " (10일 연속 보너스 +1000P!)"
    elif streak == 20:
        reward += 2000
        message += " (20일 연속 보너스 +2000P!)"
    elif streak >= 28 and streak <= 31: # 매달 말일 기준으로 한달 체크는 복잡하므로 30일 근처로 보상 처리
        # 실제 한달 연속은 streak % 30 == 0 또는 특정 로직 필요
        if streak == 30:
            reward += 3000
            message += " (한 달 연속 보너스 +3000P!)"
    
    progress.total_points += reward
    
    # 출석 레코드 생성
    new_record = AttendanceRecord(date=today, points_earned=reward)
    db.add(new_record)
    
    db.commit()
    
    return {
        "message": message,
        "reward": reward,
        "streak": streak,
        "total_points": progress.total_points,
        "date": today.isoformat()
    }

@router.post("/water")
def give_water(db: Session = Depends(get_db)):
    progress = db.query(UserProgress).first()
    if not progress:
        raise HTTPException(status_code=404, detail="사용자 정보를 찾을 수 없습니다.")
    
    if progress.total_points < WATER_COST:
        raise HTTPException(status_code=400, detail=f"포인트가 부족합니다. (필요: {WATER_COST}P)")
    
    progress.total_points -= WATER_COST
    progress.current_exp += WATER_EXP
    
    # 레벨업 체크
    while progress.level < 50 and progress.current_exp >= LEVEL_MAX_EXP[progress.level]:
        progress.current_exp -= LEVEL_MAX_EXP[progress.level]
        progress.level += 1
        
    db.commit()
    return {"message": "물을 주었습니다!", "exp_gained": WATER_EXP, "current_level": progress.level}

@router.post("/supplement")
def give_supplement(db: Session = Depends(get_db)):
    progress = db.query(UserProgress).first()
    if not progress:
        raise HTTPException(status_code=404, detail="사용자 정보를 찾을 수 없습니다.")
    
    if progress.total_points < SUPPLEMENT_COST:
        raise HTTPException(status_code=400, detail=f"포인트가 부족합니다. (필요: {SUPPLEMENT_COST}P)")
    
    progress.total_points -= SUPPLEMENT_COST
    progress.current_exp += SUPPLEMENT_EXP
    
    # 레벨업 체크
    while progress.level < 50 and progress.current_exp >= LEVEL_MAX_EXP[progress.level]:
        progress.current_exp -= LEVEL_MAX_EXP[progress.level]
        progress.level += 1
        
    db.commit()
    return {"message": "영양제를 주었습니다!", "exp_gained": SUPPLEMENT_EXP, "current_level": progress.level}

@router.get("/progress", response_model=ProgressOut)
def get_progress(db: Session = Depends(get_db)):
    progress = db.query(UserProgress).first()
    if not progress:
        progress = UserProgress(total_points=0, level=1, current_exp=0, attendance_streak=0)
        db.add(progress)
        db.commit()
        db.refresh(progress)
        
    return ProgressOut(
        total_points=progress.total_points,
        level=progress.level,
        level_name=LEVEL_NAMES.get(progress.level, "씨앗"),
        current_exp=progress.current_exp,
        max_exp=LEVEL_MAX_EXP.get(progress.level, 100),
        attendance_streak=progress.attendance_streak
    )
