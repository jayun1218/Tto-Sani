from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.expense import Mission, UserProgress, AttendanceRecord, StepRecord

router = APIRouter(prefix="/gamification", tags=["gamification"])

class StepSync(BaseModel):
    steps: int

@router.post("/steps/sync")
def sync_steps(data: StepSync, db: Session = Depends(get_db)):
    progress = db.query(UserProgress).first()
    if not progress:
        progress = UserProgress(total_points=0, level=1)
        db.add(progress)
    
    today = datetime.now().date()
    record = db.query(StepRecord).filter(StepRecord.date == today).first()
    
    if not record:
        record = StepRecord(date=today, step_count=data.steps, points_earned=0)
        db.add(record)
    else:
        record.step_count = data.steps
    
    reward_granted = False
    # 보상 기준: 10,000보 달성 시 100P 지급 (하루 한 번)
    if record.step_count >= 10000 and record.points_earned == 0:
        record.points_earned = 100
        progress.total_points += 100
        reward_granted = True
        
    db.commit()
    db.refresh(progress)
    
    return {
        "message": "걸음수가 동기화되었습니다." if not reward_granted else "축하합니다! 10,000보 달성 보상 100P가 지급되었습니다.",
        "today_steps": record.step_count,
        "total_points": progress.total_points,
        "reward_granted": reward_granted
    }

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

import random

MISSION_POOL = [
    {"title": "오늘 카페 가지 않기", "description": "커피 대신 텀블러를 사용해보세요!", "points": 15},
    {"title": "무지출 챌린지", "description": "오늘 하루 지출 0원에 도전하세요!", "points": 50},
    {"title": "편의점 유혹 이기기", "description": "편의점 대신 집밥을 먹어보세요!", "points": 20},
    {"title": "배달 대신 요리하기", "description": "배달료를 아끼고 직접 요리해봐요.", "points": 30},
    {"title": "중고 거래 앱 안보기", "description": "필요 없는 물건 구경을 멈춰보세요.", "points": 15},
    {"title": "장바구니 비우기", "description": "충동적으로 담아둔 물건을 비워보세요.", "points": 20},
    {"title": "대중교통 이용하기", "description": "택시 대신 버스나 지하철을 타보세요.", "points": 25},
    {"title": "마라탕/치킨 참기", "description": "오늘 밤 야식의 유혹을 참아보세요.", "points": 30},
    {"title": "물 2리터 마시기", "description": "건강도 챙기고 돈도 아끼는 물 마시기!", "points": 15},
    {"title": "소비 일기 작성하기", "description": "오늘의 소비를 한 줄로 기록해보세요.", "points": 10},
    {"title": "1만보 걷기", "description": "돈도 아끼고 건강도 챙기는 걷기 운동!", "points": 20},
    {"title": "도서관 방문하기", "description": "책을 사는 대신 빌려 읽어보세요.", "points": 25},
    {"title": "중고 물품 판매하기", "description": "안 쓰는 물건을 팔아 수익을 내보세요.", "points": 40},
    {"title": "OTT 하나 해지하기", "description": "안 보는 구독 서비스를 정리해보세요.", "points": 50},
    {"title": "자판기 음료 참기", "description": "목마를 땐 미리 챙긴 물을 마셔요.", "points": 10},
    {"title": "마트 대신 냉장고 파먹기", "description": "냉장고 속 재료로 맛있는 한 끼!", "points": 30},
    {"title": "취미 생활 즐기기", "description": "돈 안 드는 취미로 하루를 채워보세요.", "points": 20},
    {"title": "가계부 정산하기", "description": "이번 주 지출을 꼼꼼히 체크해보세요.", "points": 15},
    {"title": "명상 5분 하기", "description": "마음이 안정되면 지출 욕구도 줄어들어요.", "points": 10},
    {"title": "나를 위한 저축", "description": "아낀 돈을 별도 계좌에 저금해보세요.", "points": 25}
]

@router.get("/missions", response_model=List[MissionOut])
def get_daily_missions(db: Session = Depends(get_db)):
    today = datetime.now().date()
    missions = db.query(Mission).filter(Mission.date == today).all()
    
    # 미션이 없으면 랜덤 미션 생성
    if not missions:
        selected_missions = random.sample(MISSION_POOL, 3)
        new_missions = [
            Mission(
                title=m["title"], 
                description=m["description"], 
                points=m["points"], 
                date=today
            ) for m in selected_missions
        ]
        db.add_all(new_missions)
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
