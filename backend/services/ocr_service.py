import os
import base64
import json
from typing import Dict, Any, Optional
from openai import OpenAI

# OpenAI 설정
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def encode_image(image_path: str) -> str:
    """이미지 파일을 base64 문자열로 인코딩한다."""
    file_size = os.path.getsize(image_path) / (1024 * 1024)
    print(f"📦 [OCR] 인코딩 시작: {image_path} (크기: {file_size:.2f}MB)")
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def analyze_receipt(image_path: str) -> Optional[Dict[str, Any]]:
    """
    OpenAI GPT-4o-mini (Vision)를 사용하여 영수증 이미지에서 정보를 추출한다.
    반환 형식: {"description": str, "amount": float, "category": str, "date": str}
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key == "your_openai_api_key_here":
        print("❌ OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")
        return None

    try:
        client = OpenAI(api_key=api_key)
        base64_image = encode_image(image_path)

        prompt = """영수증 이미지에서 다음 정보를 추출하여 JSON 형식으로 응답해주세요:
- description: 구매처 또는 상품명 (간략하게)
- amount: 총 결제 금액 (숫자만)
- category: 다음 중 하나 선택 (식당, 카페, 쇼핑, 교통, 배달, 의료/건강, 문화/여가, 구독, 기타)
- date: 결제 날짜 (YYYY-MM-DD 형식)

응답은 반드시 마크다운 코드 블록 없는 순수 JSON 문자열이어야 합니다."""

        print("🚀 [OCR] OpenAI API 호출 중...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            max_tokens=300,
            timeout=30.0 # 30초 타임아웃 추가
        )
        print("✅ [OCR] OpenAI API 응답 수신 완료")

        content = response.choices[0].message.content
        if not content:
            return None
            
        # JSON 파싱 (코드 블록 방어 로직)
        clean_content = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_content)
        
        return {
            "description": data.get("description", "불명"),
            "amount": float(data.get("amount", 0)),
            "category": data.get("category", "기타"),
            "date": data.get("date", None)
        }

    except Exception as e:
        print(f"OCR 분석 에러: {e}")
        return None
