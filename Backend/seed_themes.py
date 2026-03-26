"""
运行方式：python seed_themes.py
用于初始化官方主题数据
"""
from database import SessionLocal
import models

OFFICIAL_THEMES = [
    {"title": "最难以名状的食堂美食", "emoji": "🍜", "description": "展示你在食堂吃到的最离谱的饭菜"},
    {"title": "宿舍最强卧龙凤雏", "emoji": "🛏️", "description": "晒出你宿舍最迷惑的生活方式"},
    {"title": "期末复习现场", "emoji": "📚", "description": "你的期末备考状态是什么样的"},
    {"title": "校园最迷惑穿搭", "emoji": "👗", "description": "今天你穿了什么出门"},
    {"title": "图书馆占座神器", "emoji": "📖", "description": "你用什么占座，晒出来"},
]

def seed():
    db = SessionLocal()
    try:
        existing = db.query(models.Theme).filter(models.Theme.is_official == True).count()
        if existing > 0:
            print(f"已有 {existing} 个官方主题，跳过")
            return
        for t in OFFICIAL_THEMES:
            db.add(models.Theme(**t, is_official=True))
        db.commit()
        print(f"成功创建 {len(OFFICIAL_THEMES)} 个官方主题")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
