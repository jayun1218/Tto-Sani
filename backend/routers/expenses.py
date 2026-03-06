"""
소비 내역 업로드 및 조회 라우터
CSV 형식: 날짜, 가맹점명/내용, 금액
"""

import io
import csv
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.expense import Expense
from services.classifier import classify_expense

router = APIRouter(prefix="/expenses", tags=["expenses"])


class ExpenseCreate(BaseModel):
    date: Optional[str] = None
    description: str
    amount: float
    category: str


class ExpenseOut(BaseModel):
    id: int
    date: Optional[str]
    description: str
    amount: float
    category: str
    is_impulse: int

    class Config:
        from_attributes = True


def _parse_date(date_str: str) -> Optional[datetime]:
    """다양한 날짜 포맷을 파싱한다."""
    formats = ["%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%m/%d/%Y", "%d/%m/%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    return None


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    CSV 파일을 업로드하여 소비 내역을 파싱하고 DB에 저장한다.
    
    CSV 예시 형식:
    날짜,가맹점명,금액
    2024-01-15,스타벅스,6500
    2024-01-16,배달의민족,25000
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV 파일만 업로드 가능합니다.")

    content = await file.read()

    # 인코딩 자동 감지 (UTF-8 → EUC-KR)
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("euc-kr", errors="ignore")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    if len(rows) < 2:
        raise HTTPException(status_code=400, detail="CSV 데이터가 비어 있습니다.")

    # 기존 데이터 초기화 후 새로 삽입
    db.query(Expense).delete()

    saved = 0
    skipped = 0

    for row in rows[1:]:  # 헤더 건너뜀
        if len(row) < 2:
            skipped += 1
            continue

        # 컬럼 수에 따라 유연하게 처리
        if len(row) == 2:
            date_val, description, amount_str = None, row[0].strip(), row[1].strip()
        elif len(row) >= 3:
            date_val = _parse_date(row[0])
            description = row[1].strip()
            amount_str = row[2].strip()
        else:
            skipped += 1
            continue

        # 금액 파싱 (쉼표, 원 기호 제거)
        amount_str = amount_str.replace(",", "").replace("원", "").strip()
        try:
            amount = float(amount_str)
        except ValueError:
            skipped += 1
            continue

        if amount <= 0:
            skipped += 1
            continue

        category = classify_expense(description)

        expense = Expense(
            date=date_val,
            description=description,
            amount=amount,
            category=category,
        )
        db.add(expense)
        saved += 1

    db.commit()

    return {
        "message": f"{saved}건의 소비 내역이 저장되었습니다.",
        "saved": saved,
        "skipped": skipped,
    }


@router.post("/", response_model=ExpenseOut)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    """수동으로 지출 내역을 입력한다."""
    date_val = _parse_date(expense_in.date) if expense_in.date else datetime.now().date()
    
    expense = Expense(
        date=date_val,
        description=expense_in.description,
        amount=expense_in.amount,
        category=expense_in.category,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return ExpenseOut(
        id=expense.id,
        date=str(expense.date) if expense.date else None,
        description=expense.description,
        amount=expense.amount,
        category=expense.category,
        is_impulse=expense.is_impulse
    )


@router.get("/", response_model=List[ExpenseOut])
def get_expenses(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """소비 내역 목록을 반환한다. category 파라미터로 필터링 가능."""
    query = db.query(Expense)
    if category:
        query = query.filter(Expense.category == category)
    expenses = query.order_by(Expense.date.desc().nullsfirst()).all()
    return [
        ExpenseOut(
            id=e.id,
            date=str(e.date) if e.date else None,
            description=e.description,
            amount=e.amount,
            category=e.category,
            is_impulse=e.is_impulse,
        )
        for e in expenses
    ]


@router.delete("/")
def delete_all(db: Session = Depends(get_db)):
    """전체 소비 내역 초기화."""
    db.query(Expense).delete()
    db.commit()
    return {"message": "모든 소비 내역이 삭제되었습니다."}
