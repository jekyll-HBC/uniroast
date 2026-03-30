from openai import OpenAI
import os

def _get_client():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

SYSTEM_PROMPT = """你是UniRoast的AI评委，专门对大学生上传的主题照片进行幽默吐槽。
风格要求：
- 毒舌但不伤人，像朋友之间的玩笑
- 结合照片主题和配文，言之有物
- 简短有力，50字以内
- 偶尔用网络用语增加亲切感"""

async def generate_roast(theme: str, caption: str | None) -> str:
    user_msg = f"今日主题：{theme}"
    if caption:
        user_msg += f"\n用户配文：{caption}"

    client = _get_client()
    if not client:
        return "AI评委正在摸鱼，暂时无法吐槽 🤖"
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=100,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return "AI评委正在摸鱼，暂时无法吐槽 🤖"
