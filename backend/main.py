"""
또사니(Tto-Sani) FastAPI 메인 앱
"""

import os
from dotenv import load_dotenv
load_dotenv()  # 모든 임포트 전에 호출하여 환경변수 주입 보장

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models.expense  # 모델 임포트로 테이블 생성 트리거

from routers.expenses import router as expenses_router
from routers.analysis import router as analysis_router
from routers.gamification import router as gamification_router
from routers.native import router as native_router

# DB 테이블 생성
models.expense.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="또사니 API",
    description="AI 기반 소비 패턴 분석 서비스",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses_router)
app.include_router(analysis_router)
app.include_router(gamification_router)
app.include_router(native_router)


@app.get("/")
def root():
    return {"message": "또사니 API 서버가 실행 중입니다.", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
