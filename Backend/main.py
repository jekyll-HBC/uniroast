from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database import engine, SessionLocal
import models
from routers import auth as auth_router
from routers import posts as posts_router
from routers import upload as upload_router
from routers import themes as themes_router
from routers import seasons as seasons_router
from routers.seasons import get_or_create_current_season
from datetime import date
import schemas

models.Base.metadata.create_all(bind=engine)


def rollover_season():
    """每周日午夜：快照当前赛季排名，创建新赛季"""
    db = SessionLocal()
    try:
        season = db.query(models.Season).filter(models.Season.is_active == True).first()
        if not season or season.end_date > date.today():
            return

        posts = (
            db.query(models.Post)
            .filter(
                models.Post.created_at >= season.start_date,
                models.Post.vote_count > 0,
            )
            .order_by(models.Post.avg_score.desc(), models.Post.vote_count.desc())
            .limit(50)
            .all()
        )
        for i, p in enumerate(posts):
            db.add(models.SeasonSnapshot(
                season_id=season.id,
                post_id=p.id,
                rank=i + 1,
                avg_score=p.avg_score,
                vote_count=p.vote_count,
                tier=schemas.score_to_tier(p.avg_score, p.vote_count),
            ))

        season.is_active = False

        from datetime import timedelta
        next_monday = date.today() + timedelta(days=1)
        next_sunday = next_monday + timedelta(days=6)
        count = db.query(models.Season).count()
        db.add(models.Season(number=count + 1, start_date=next_monday, end_date=next_sunday, is_active=True))
        db.commit()
    finally:
        db.close()


scheduler = AsyncIOScheduler()
scheduler.add_job(rollover_season, 'cron', day_of_week='sun', hour=23, minute=59)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        get_or_create_current_season(db)
    finally:
        db.close()
    if not scheduler.running:
        scheduler.start()
    yield
    if scheduler.running:
        scheduler.shutdown()


app = FastAPI(title="UniRoast API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://uniroast.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(posts_router.router)
app.include_router(upload_router.router)
app.include_router(themes_router.router)
app.include_router(seasons_router.router)

@app.get("/")
def read_root():
    return {"message": "UniRoast API is running! 🚀"}
