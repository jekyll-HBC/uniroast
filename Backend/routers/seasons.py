from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/seasons", tags=["seasons"])


def get_or_create_current_season(db: Session) -> models.Season:
    """获取当前活跃赛季，如果不存在则创建第一个"""
    season = db.query(models.Season).filter(models.Season.is_active == True).first()
    if season:
        return season
    today = date.today()
    # 从本周一开始
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    count = db.query(models.Season).count()
    season = models.Season(number=count + 1, start_date=monday, end_date=sunday, is_active=True)
    db.add(season)
    db.commit()
    db.refresh(season)
    return season


@router.get("/current", response_model=schemas.SeasonOut)
def current_season(db: Session = Depends(get_db)):
    return get_or_create_current_season(db)


@router.get("/current/leaderboard", response_model=list[schemas.SeasonSnapshotOut])
def current_leaderboard(theme_id: int | None = None, db: Session = Depends(get_db)):
    """当前赛季排行榜：只统计本赛季内创建的帖子"""
    season = get_or_create_current_season(db)
    q = db.query(models.Post).filter(
        models.Post.created_at >= season.start_date,
        models.Post.vote_count > 0,
    )
    if theme_id:
        q = q.filter(models.Post.theme_id == theme_id)
    posts = q.order_by(models.Post.avg_score.desc(), models.Post.vote_count.desc()).limit(50).all()
    return [
        schemas.SeasonSnapshotOut(
            rank=i + 1,
            avg_score=p.avg_score,
            vote_count=p.vote_count,
            tier=schemas.ratio_to_tier(p.heng_count, p.vote_count),
            post=schemas.PostOut.from_orm_with_tier(p),
        )
        for i, p in enumerate(posts)
    ]


@router.get("/history", response_model=list[schemas.SeasonOut])
def season_history(db: Session = Depends(get_db)):
    return db.query(models.Season).order_by(models.Season.number.desc()).all()


@router.get("/{season_id}/leaderboard", response_model=list[schemas.SeasonSnapshotOut])
def season_leaderboard(season_id: int, db: Session = Depends(get_db)):
    """历史赛季快照排行榜"""
    snapshots = (
        db.query(models.SeasonSnapshot)
        .filter(models.SeasonSnapshot.season_id == season_id)
        .order_by(models.SeasonSnapshot.rank)
        .limit(50)
        .all()
    )
    return [
        schemas.SeasonSnapshotOut(
            rank=s.rank,
            avg_score=s.avg_score,
            vote_count=s.vote_count,
            tier=s.tier,
            post=schemas.PostOut.from_orm_with_tier(s.post),
        )
        for s in snapshots
    ]
