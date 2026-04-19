"""运行: python seed.py"""
from datetime import date
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 避免重复插入
if db.query(models.Theme).count() > 0:
    print("已有数据，跳过")
    db.close()
    exit()

themes = [
    models.Theme(title="宿舍奇葩室友", emoji="🛏️", description="晒出你室友最离谱的操作", is_official=True, active_date=date.today()),
    models.Theme(title="食堂黑暗料理", emoji="🍱", description="你吃过最迷的食堂菜", is_official=True),
    models.Theme(title="期末复习现场", emoji="📚", description="考前最后一夜的真实状态", is_official=False),
]
db.add_all(themes)
db.commit()
print(f"已插入 {len(themes)} 个主题，今日主题：{themes[0].title}")
db.close()
