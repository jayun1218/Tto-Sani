from typing import List, Dict, Any
from models.expense import Expense, UserProgress
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

def update_user_persona(db: Session):
    """
    최근 30일간의 소비 데이터를 분석하여 사용자의 페르소나를 업데이트한다.
    """
    # 1. 최근 30일 데이터 가져오기
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    expenses = db.query(Expense).filter(Expense.date >= thirty_days_ago).all()
    
    if not expenses:
        return "평범한 새싹"

    # 2. 분석 지표 계산
    total_amount = sum(e.amount for e in expenses)
    category_counts = {}
    impulse_count = sum(1 for e in expenses if e.is_impulse == 1)
    
    for e in expenses:
        category_counts[e.category] = category_counts.get(e.category, 0) + e.amount

    # 3. 페르소나 결정 로직
    # 비중이 가장 높은 카테고리 확인
    top_category = max(category_counts, key=category_counts.get) if category_counts else "기타"
    
    persona = "평범한 새싹"
    
    if impulse_count >= 5:
        persona = "지름신 부엉이"  # 충동 구매가 잦음
    elif top_category == "카페":
        persona = "카페인 중독 고양이"
    elif top_category == "식당" or top_category == "배달":
        persona = "미식가 강아지"
    elif top_category == "쇼핑":
        persona = "트렌드세터 여우"
    elif total_amount < 300000:
        persona = "철벽 다람쥐" # 매우 절약함
    else:
        persona = "성실한 나무지기"

    # 4. DB 업데이트
    progress = db.query(UserProgress).first()
    if not progress:
        progress = UserProgress(persona=persona)
        db.add(progress)
    else:
        progress.persona = persona
    
    db.commit()
    return persona

def get_persona_message(persona: str) -> str:
    """페르소나별 캐릭터 메시지를 반환한다."""
    messages = {
        "지름신 부엉이": "부엉! 또 사시는 건 아니죠? 눈을 크게 뜨고 지켜보고 있어요!",
        "카페인 중독 고양이": "야옹~ 향긋한 커피도 좋지만, 가끔은 지갑도 쉬게 해주세요.",
        "미식가 강아지": "멍멍! 맛있는 거 드셨군요? 하지만 배부른 만큼 지갑은 홀쭉해졌어요.",
        "트렌드세터 여우": "오호, 역시 센스쟁이! 하지만 유행보다 중요한 건 예산 관리랍니다.",
        "철벽 다람쥐": "찍찍! 도토리를 아주 잘 모으고 계시네요. 정말 든든해요!",
        "성실한 나무지기": "안녕! 오늘도 나무가 무럭무럭 자라고 있네요. 꾸준함이 최고예요!",
        "평범한 새싹": "안녕! 우리 함께 멋진 나무를 키워봐요. 기록을 시작해볼까요?"
    }
    return messages.get(persona, messages["평범한 새싹"])
