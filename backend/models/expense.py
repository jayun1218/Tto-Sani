from sqlalchemy import Column, Integer, String, Float, Date
from database import Base
from datetime import datetime


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=True)
    description = Column(String, nullable=False)  # 가맹점명 / 거래 내용
    amount = Column(Float, nullable=False)          # 지출 금액
    category = Column(String, default="기타")       # 분류된 카테고리
    is_impulse = Column(Integer, default=0)         # 충동 소비 여부 (0/1)


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    points = Column(Integer, default=10)
    is_completed = Column(Integer, default=0)
    date = Column(Date, default=datetime.now().date)


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    total_points = Column(Integer, default=0)
    level = Column(Integer, default=1)  # 1: 씨앗, 2: 새싹, 3: 어린 나무, 4: 큰 나무, 5: 황금 나무
    current_exp = Column(Integer, default=0)  # 현재 레벨에서의 경험치
    attendance_streak = Column(Integer, default=0)  # 연속 출석 일수
    last_attendance_date = Column(Date)
    last_mission_date = Column(Date)
class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=datetime.now().date, unique=True) # 하루에 하나만 기록
    points_earned = Column(Integer, default=100)
