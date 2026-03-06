# 💰 또사니 (Tto-Sani)
**AI 기반 소비 패턴 분석 및 게이미피케이션 가계부**

"또 사니?"라는 질문에서 시작된, 당신의 소비를 바꾸는 가장 즐거운 방법.
단순한 기록을 넘어 AI가 당신의 소비 페르소나를 찾고, 돈나무를 키우며 즐겁게 자산을 관리하세요.

---

## ✨ 핵심 기능 (Features)

### 1. 지능형 자산 계획 & 분석 (V3.1)
- **합산형 예산 플래너**: 카테고리별 목표 예산을 설정하면 전체 지출 목표가 자동으로 계산되는 직관적인 계획 시스템.
- **AI 소비 인사이트**: OpenAI GPT-4o 기반으로 현재 소비 패턴을 분석해 개인 맞춤형 절약 전략과 충동 소비 경고 제공.
- **미래 지출 예측**: 현재 소비 속도를 분석해 이번 달 말 총 지출액을 미리 예측하고 상태(정상/경고) 시각화.
- **소비 트렌드 리포트**: 전월 및 전년 동월 대비 지출 변화를 차트로 한눈에 비교 분석.

### 2. 스마트 구독 매니저 (Subscription Manager)
- **숨은 고정 지출 탐지**: 지출 내역에서 넷플릭스, 유튜브, 쿠팡 등 정기 구독 키워드를 AI가 자동으로 식별하여 리스트업.
- **카드형 구독 보드**: 고정적으로 나가는 서비스들을 세련된 카드 레이아웃으로 관리하고 월간 총 구독료 실시간 집계.

### 3. iOS 네이티브 시너지 (Hybrid Integration)
- **실시간 위젯 (WidgetKit)**: 아이폰 홈 화면에서 앱을 열지 않고도 이번 달 남은 예산과 지출 현황을 실시간으로 확인.
- **HealthKit 데이터 동기화**: 아이폰 건강 앱과 연동하여 실시간 걸음수를 측정하고 만보 달성 시 돈나무 성장을 위한 포인트 지급.
- **위치 기반 트리거 (LBS)**: 카페, 대형 마트 등 과소비 위험 상권 진입 시 유혹 주의 알림 및 절약 미션 제안.

### 4. 게이미피케이션 & 보상 (Gamification)
- **돈나무 성장 시스템**: 절약과 미션 수행으로 얻은 포인트로 10단계의 3D 돈나무를 키우는 재미있는 자산 관리.
- **데일리 랜덤 미션**: 매일 자정에 갱신되는 20종 이상의 랜덤 미션으로 지루함 없는 절약 습관 형성.
- **스마트 출석체크**: 캘린더 기반의 출석 관리 및 연속 출석에 따른 강력한 보상 체계.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: React Hooks (useEffect, useState)
- **Styling**: Vanilla CSS (Custom Design System, Premium UI/UX)
- **Visualization**: Chart.js, react-chartjs-2

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Data Analysis**: Pandas, Numpy
- **AI Integrations**: OpenAI GPT-4o / Gemini Pro / AI 3D Image Rendering

---

## 🚀 설치 및 시작하기 (Getting Started)

### 1. 백엔드 설정 (Backend)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*`.env` 파일에 API 키를 설정하면 고도화된 AI 기능을 사용할 수 있습니다.*

### 2. 프론트엔드 설정 (Frontend)
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 프로젝트 구조 (Structure)
```
Tto-Sani/
├── backend/            # FastAPI 서버 및 데이터베이스
│   ├── ai/             # AI 분석 및 조언 엔진
│   ├── models/         # SQLAlchemy 모델 (Expense, Attendance 등)
│   ├── routers/        # 기능별 API 엔드포인트
│   └── main.py         # 앱 진입점
├── frontend/           # Next.js 클라이언트
│   ├── src/
│   │   ├── app/        # 페이지 레이아웃 (Dashboard, Tree, Attendance)
│   │   └── components/ # UI 컴포넌트 (Navbar, MoneyTree 등)
└── README.md           # 프로젝트 가이드라인
```

---

**또사니와 함께 당신의 소비 습관을 성장시키세요!** 😊🌳💎
