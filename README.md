# 💰 또사니 (Tto-Sani)
**AI 기반 소비 패턴 분석 및 게이미피케이션 가계부**

"또 사니?"라는 질문에서 시작된, 당신의 소비를 바꾸는 가장 즐거운 방법.
단순한 기록을 넘어 AI가 당신의 소비 페르소나를 찾고, 돈나무를 키우며 즐겁게 자산을 관리하세요.

---

## ✨ 핵심 기능 (Features)

### 1. 초프리미엄 지능형 리포트 (V2.1)
- **AI 미래 지출 예측**: 현재 소비 속도를 분석해 이번 달 총 지출을 미리 예측하고, 목표 달성을 위한 일일 권장 지출 가이드 제공.
- **실시간 지출 감시자 (Budget Watchdog)**: 현재 소비 패턴을 분석해 과거 대비 급격한 지출 증가를 감지하여 대시보드에 즉시 경고 전송.
- **글래스모피즘 UI**: 최신 디자인 트렌드인 Glassmorphism과 세련된 애니메이션을 적용해 압도적인 사용성 제공.
- **개인화 페르소나 카드**: 소비 유형에 따른 칭호와 전용 아바타 부여로 즐거운 자산 관리 경험 제공.

### 2. 정기 구독 매니저 (Subscription Manager)
- **숨은 고정 지출 탐지**: 지출 내역에서 넷플릭스, 유튜브 등 정기 구독료를 AI가 자동으로 식별.

### 3. iOS 네이티브 시너지 (Hybrid Integration)
- **iOS HealthKit 연동**: 아이폰 건강 앱과 연동하여 실시간 걸음수를 측정하고 10,000보 달성 시 보상 포인트 지급.
- **위젯 & 워치 전용 API**: 아이폰 홈 화면 위젯 및 애플워치를 위한 고성능 경량 데이터 API(`GET /native/summary`) 인프라 구축.
- **위치 기반 트리거 (LBS)**: 카페, 대형 마트 등 상권 진입 시 절약 미션을 제안하는 위치 기반 인터랙션 제공.

### 4. 게이미피케이션 & 보상 (Gamification)
- **돈나무 성장 시스템**: 10단계의 정교한 3D 비주얼 돈나무를 키우며 저축의 재미를 극대화.
- **일일 랜덤 미션**: 매일 자정 20종 이상의 미션 중 3개가 랜덤 선택되어 매일 새로운 절약 도전 제공.
- **스마트 출석체크**: 캘린더 UI를 통한 출석 관리 및 강력한 연속 출석 보상 체계(최대 3,000P).

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
