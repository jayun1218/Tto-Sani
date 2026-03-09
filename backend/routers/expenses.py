import io
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.expense import Expense
from services.classifier import classify_expense
from services.ocr_service import analyze_receipt
from fastapi import File, UploadFile
import shutil
import os

router = APIRouter(prefix="/expenses", tags=["expenses"])


class ExpenseCreate(BaseModel):
    date: Optional[str] = None
    description: str
    amount: float
    category: str
    emotion: Optional[str] = None


class ExpenseOut(BaseModel):
    id: int
    date: Optional[str]
    description: str
    amount: float
    category: str
    is_impulse: int
    emotion: Optional[str]

    class Config:
        from_attributes = True


@router.post("/", response_model=ExpenseOut)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    """수동으로 지출 내역을 입력한다."""
    try:
        date_val = datetime.strptime(expense_in.date, "%Y-%m-%d").date() if expense_in.date else datetime.now().date()
    except ValueError:
        date_val = datetime.now().date()
    
    expense = Expense(
        date=date_val,
        description=expense_in.description,
        amount=expense_in.amount,
        category=expense_in.category,
        emotion=expense_in.emotion
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
        is_impulse=expense.is_impulse,
        emotion=expense.emotion
    )


@router.post("/ocr")
async def ocr_expense(file: UploadFile = File(...)):
    """영수증 이미지를 분석하여 데이터만 반환한다 (DB 저장 안 함)."""
    os.makedirs("temp_uploads", exist_ok=True)
    file_path = f"temp_uploads/{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        analysis = analyze_receipt(file_path)
        
        if not analysis:
            raise HTTPException(status_code=400, detail="영수증 분석에 실패했습니다. API 키나 파일 형식을 확인해주세요.")

        return analysis # 분석된 데이터만 반환 (description, amount, category, date)

    finally:
        # 임시 파일 삭제
        if os.path.exists(file_path):
            os.remove(file_path)


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
            emotion=e.emotion,
        )
        for e in expenses
    ]


@router.delete("/")
def delete_all(db: Session = Depends(get_db)):
    """전체 소비 내역 초기화."""
    db.query(Expense).delete()
    db.commit()
    return {"message": "모든 소비 내역이 삭제되었습니다."}
