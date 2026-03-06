# 💰 또사니 (Tto-Sani)
**AI 기반 소비 패턴 분석 및 게이미피케이션 가계부**

"또 사니?"라는 질문에서 시작된, 당신의 소비를 바꾸는 가장 즐거운 방법.
단순한 기록을 넘어 AI가 당신의 소비 페르소나를 찾고, 돈나무를 키우며 즐겁게 자산을 관리하세요.

---

## ✨ 핵심 기능 (Features)

### 1. 지능형 소비 분석 대시보드
- **개인화 페르소나 카드**: 소비 데이터를 분석해 "프로 구독러", "커피 마니아" 등 사용자만의 칭호와 전용 아바타 부여.
- **2x2 스마트 그리드**: 총 지출, 거래 건수, 주요 카테고리, 최고 지출 비율을 직관적인 그리드로 배치.
- **월간 자동 초기화**: 매달 자동으로 데이터를 필터링하여 "N월 소비 현황"을 집중적으로 관리.

### 2. 게이미피케이션 (Grow Money Tree)
- **10단계 성장 시스템**: 포인트로 씨앗에서 거대한 돈나무까지 키우는 몰입형 경험.
- **프리미엄 3D 비주얼**: AI로 생성된 고품질 3D 이미지를 정교한 배경 제거(누끼) 작업을 통해 프리미엄하게 구현.
- **성장 애니메이션**: 각 단계별로 생동감 있게 변화하는 돈나무의 모습을 확인 가능.

### 3. 스마트 출석체크 & 보상
- **월간 캘린더 시스템**: 도장을 찍듯 기록하는 캘린더 UI로 매일의 출석을 재미있게 관리.
- **누적 연속 보상**: 5일(500P), 10일(1000P), 20일(2000P), 30일(3000P) 등 강력한 연속 출석 보상 체계.
- **실시간 포인트 연동**: NavBar에서 실시간으로 업데이트되는 포인트를 확인하며 성취감 제공.

### 4. 소비 인사이트 및 관리
- **AI 소비 진단**: OpenAI 및 Gemini API를 활용한 충동 소비 탐지 및 맞춤형 절약 팁 제안.
- **CSV 대량 업로드**: 기존 카드 내역 데이터를 한 번에 업로드하여 과거 소비 패턴까지 분석.
- **리포트 자동 생성**: 카테고리별 비중을 시각화된 차트(Doughnut, Bar)로 제공.

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
