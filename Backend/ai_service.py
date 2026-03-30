from openai import OpenAI
import os

def _get_client():
    api_key = os.getenv("ARK_API_KEY")
    print(f"[ai_service] ARK_API_KEY={'set' if api_key else 'MISSING'}")
    if not api_key:
        return None
    return OpenAI(api_key=api_key, base_url="https://ark.cn-beijing.volces.com/api/v3")

SYSTEM_PROMPT = """你是UniRoast的AI评委，专门对大学生上传的主题照片进行幽默吐槽。
风格要求：
- 毒舌但不伤人，像朋友之间的玩笑
- 结合照片内容、主题和配文，言之有物
- 简短有力，50字以内
- 偶尔用网络用语增加亲切感"""

async def generate_roast(theme: str, caption: str | None, image_url: str | None = None) -> str:
    client = _get_client()
    if not client:
        return "AI评委正在摸鱼，暂时无法吐槽 🤖"

    text = f"今日主题：{theme}"
    if caption:
        text += f"\n用户配文：{caption}"

    if image_url:
        user_content = [
            {"type": "image_url", "image_url": {"url": image_url}},
            {"type": "text", "text": text},
        ]
    else:
        user_content = text

    try:
        response = client.chat.completions.create(
            model="doubao-1.5-vision-pro-250328",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            max_tokens=100,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[ai_service] error: {e}")
        return "AI评委正在摸鱼，暂时无法吐槽 🤖"
