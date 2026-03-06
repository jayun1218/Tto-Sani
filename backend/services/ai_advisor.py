"""
OpenAI 기반 절약 전략 추천 서비스.
API 키가 없으면 규칙 기반 추천으로 폴백된다.
"""

import os
from typing import List, Dict, Any

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


def _rule_based_tips(summary: Dict[str, Any]) -> str:
    """OpenAI 없이 규칙 기반으로 절약 팁을 생성한다."""
    by_category = summary.get("by_category", [])
    total = summary.get("total", 0)
    tips = []

    for item in by_category[:3]:  # 상위 3개 카테고리
        cat = item["category"]
        amount = item["amount"]
        ratio = item["ratio"]

        if cat == "카페" and ratio > 15:
            saving = round(amount * 0.4)
            tips.append(
                f"☕ 카페 소비({int(amount):,}원)를 40% 줄이면 월 약 {saving:,}원 절약 가능합니다. "
                f"텀블러 활용이나 홈카페를 추천드립니다."
            )
        elif cat == "배달" and ratio > 20:
            saving = round(amount * 0.35)
            tips.append(
                f"🛵 배달 소비({int(amount):,}원)가 전체의 {ratio}%입니다. "
                f"주 2회 직접 요리로 월 약 {saving:,}원 절약 가능합니다."
            )
        elif cat == "쇼핑" and ratio > 25:
            saving = round(amount * 0.3)
            tips.append(
                f"🛍️ 쇼핑 지출({int(amount):,}원)이 높습니다. "
                f"구매 전 24시간 대기 규칙을 도입하면 충동 구매를 줄일 수 있습니다."
            )
        elif cat == "구독" and amount > 50000:
            tips.append(
                f"📱 구독 서비스 비용이 {int(amount):,}원입니다. "
                f"미사용 구독을 점검해 불필요한 구독을 해지해보세요."
            )
        elif cat == "외식" and ratio > 20:
            saving = round(amount * 0.25)
            tips.append(
                f"🍽️ 외식 지출({int(amount):,}원)이 전체의 {ratio}%입니다. "
                f"주 1회 도시락 활용으로 월 약 {saving:,}원 절약 가능합니다."
            )

    if not tips:
        tips.append(
            f"💡 이번 달 총 지출은 {int(total):,}원입니다. "
            f"소비 다이어리를 작성하며 지출을 꾸준히 모니터링해보세요!"
        )

    return "\n\n".join(tips)


def generate_tips(summary: Dict[str, Any]) -> str:
    """
    소비 요약 데이터를 받아 절약 전략 텍스트를 반환한다.
    OpenAI API 키가 있으면 GPT를 사용하고, 없으면 규칙 기반으로 폴백한다.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")

    if not OPENAI_AVAILABLE or not api_key or api_key == "your_openai_api_key_here":
        return _rule_based_tips(summary)

    try:
        client = OpenAI(api_key=api_key)
        by_category = summary.get("by_category", [])
        total = summary.get("total", 0)

        category_text = "\n".join(
            [f"- {item['category']}: {int(item['amount']):,}원 ({item['ratio']}%)"
             for item in by_category]
        )

        prompt = f"""당신은 소비 패턴 분석 전문 AI 어드바이저입니다.
아래 사용자의 이번 달 소비 내역을 분석하고, 실용적인 절약 전략 3가지를 구체적인 금액과 함께 제안해주세요.

총 지출: {int(total):,}원
카테고리별 지출:
{category_text}

절약 전략은 따뜻하고 격려하는 어조로, 실천 가능한 구체적인 방법을 포함해 한국어로 작성해주세요."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.7,
        )
        return response.choices[0].message.content or _rule_based_tips(summary)

    except Exception:
        return _rule_based_tips(summary)
