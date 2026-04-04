from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date, datetime, timezone
from database import get_db
from auth import get_current_user
from ai_service import generate_roast
import models, schemas
import math

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/feed", response_model=list[schemas.FeedPostOut])
def get_feed(page: int = 1, limit: int = 20, db: Session = Depends(get_db)):
    """推荐信息流：时间衰减热度排序"""
    posts = (
        db.query(models.Post)
        .options(joinedload(models.Post.author), joinedload(models.Post.theme_obj))
        .all()
    )
    now = datetime.now(timezone.utc)

    def feed_score(post):
        created = post.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        age_hours = (now - created).total_seconds() / 3600
        return (post.heng_count + 0.5 * post.vote_count) / math.pow(age_hours + 2, 1.5)

    posts.sort(key=feed_score, reverse=True)
    offset = (page - 1) * limit
    return [schemas.FeedPostOut.from_orm_with_tier(p) for p in posts[offset: offset + limit]]


@router.get("/", response_model=list[schemas.PostOut])
def list_posts(skip: int = 0, limit: int = 20, user_id: int | None = None, theme_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Post)
    if user_id is not None:
        q = q.filter(models.Post.user_id == user_id)
    if theme_id is not None:
        q = q.filter(models.Post.theme_id == theme_id)
    posts = q.order_by(models.Post.avg_score.desc(), models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return [schemas.PostOut.from_orm_with_tier(p) for p in posts]


@router.post("/", response_model=schemas.PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    theme = db.query(models.Theme).filter(models.Theme.id == data.theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    ai_comment = await generate_roast(theme.title, data.caption, data.image_url)
    post = models.Post(
        theme_id=data.theme_id,
        image_url=data.image_url,
        caption=data.caption,
        ai_comment=ai_comment,
        user_id=current_user.id,
    )
    db.add(post)

    # 更新 streak
    today = date.today()
    if current_user.last_post_date is None or (today - current_user.last_post_date).days > 1:
        current_user.streak = 1
    elif current_user.last_post_date < today:
        current_user.streak = (current_user.streak or 0) + 1
    current_user.last_post_date = today

    db.commit()
    db.refresh(post)
    return schemas.PostOut.from_orm_with_tier(post)


@router.get("/{post_id}", response_model=schemas.PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return schemas.PostOut.from_orm_with_tier(post)


@router.post("/{post_id}/vote", response_model=schemas.VoteOut)
def vote(
    post_id: int,
    data: schemas.VoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.add(models.Vote(user_id=current_user.id, post_id=post_id, vote_type=data.vote_type))

    if data.vote_type == "heng":
        post.heng_count = (post.heng_count or 0) + 1
    post.vote_count = (post.vote_count or 0) + 1
    post.avg_score = post.heng_count / post.vote_count  # heng_rate

    new_tier = schemas.ratio_to_tier(post.heng_count, post.vote_count)

    db.add(models.PostActivity(
        post_id=post_id,
        post_owner_id=post.user_id,
        new_vote_count=post.vote_count,
        new_tier=new_tier,
    ))

    db.commit()
    return schemas.VoteOut(
        post_id=post_id,
        vote_type=data.vote_type,
        heng_count=post.heng_count,
        la_count=post.vote_count - post.heng_count,
        vote_count=post.vote_count,
        tier=new_tier,
    )
