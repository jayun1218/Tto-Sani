# 💰 또사니 (Tto-Sani)

**AI 기반 소비 패턴 분석 및 충동 소비 탐지 서비스**

사용자의 카드 및 소비 내역 데이터를 분석하여 소비 패턴을 시각화하고, 충동 소비 및 불필요 지출을 탐지하여 개인별 절약 전략을 제안하는 서비스입니다.

---

## ✨ 주요 기능

- **📂 소비 데이터 업로드**: 카드 사용 내역 CSV 파일을 드래그앤드롭으로 간편하게 업로드
- **🤖 AI 소비 자동 분류**: AI가 소비 항목을 카페, 배달, 쇼핑, 교통 등으로 자동 분류
- **📊 소비 패턴 분석**: 카테고리별 소비 비율 및 지출 통계를 시각화된 차트로 제공
- **⚡ 충동 소비 탐지**: 반복되는 소액 소비 및 이상 지출 패턴을 감지하여 경고 제공
- **💡 AI 절약 전략 추천**: 분석 데이터를 바탕으로 AI가 구체적인 절약 금액과 실천 방안 제안

---

## 🛠 사용 기술 (Tech Stack)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Custom Design System)
- **Visualization**: Chart.js, react-chartjs-2
- **API Client**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Data Analysis**: Pandas, Numpy
- **AI**: OpenAI API (GPT-4o-mini) / 정규식 기반 Fallback 분석

---

## 🚀 시작하기

### 1. 백엔드 설정 (Backend)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*`.env` 파일에 `OPENAI_API_KEY`를 설정하면 더 정확한 AI 추천을 받을 수 있습니다.*

### 2. 프론트엔드 설정 (Frontend)
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 프로젝트 구조
```
Tto-Sani/
├── backend/            # FastAPI 백엔드 서버
│   ├── ai/             # AI 분석 모듈
│   ├── models/         # DB 모델
│   ├── routers/        # API 라우터
│   ├── services/       # 비즈니스 로직 (분류, 분석, 추천)
│   └── main.py         # 진입점
├── frontend/           # Next.js 프론트엔드 앱
│   ├── src/
│   │   ├── app/        # 페이지 구성 (Upload, Dashboard, Insights)
│   │   └── components/ # 공통 컴포넌트
│   └── public/
└── README.md
```
