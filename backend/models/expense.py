from sqlalchemy import Column, Integer, String, Float, Date
from database import Base
from datetime import date


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=True)
    description = Column(String, nullable=False)  # 가맹점명 / 거래 내용
    amount = Column(Float, nullable=False)          # 지출 금액
    category = Column(String, default="기타")       # 분류된 카테고리
    is_impulse = Column(Integer, default=0)         # 충동 소비 여부 (0/1)
