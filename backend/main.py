"""
또사니(Tto-Sani) FastAPI 메인 앱
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models.expense  # 모델 임포트로 테이블 생성 트리거

from routers.expenses import router as expenses_router
from routers.analysis import router as analysis_router
from routers.gamification import router as gamification_router

load_dotenv()

# DB 테이블 생성
import models.expense  # 모든 모델 테이블 생성 보장
models.expense.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="또사니 API",
    description="AI 기반 소비 패턴 분석 서비스",
    version="1.0.0",
)

# ... (CORS 설정 생략) ...

app.include_router(expenses_router)
app.include_router(analysis_router)
app.include_router(gamification_router)


@app.get("/")
def root():
    return {"message": "또사니 API 서버가 실행 중입니다.", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
