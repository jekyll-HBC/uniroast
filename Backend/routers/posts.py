from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from ai_service import generate_roast
import models, schemas
import asyncio

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=list[schemas.PostOut])
def list_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ai_comment = await generate_roast(data.theme, data.caption)
    post = models.Post(**data.model_dump(), user_id=current_user.id, ai_comment=ai_comment)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/{post_id}", response_model=schemas.PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/{post_id}/vote", response_model=schemas.VoteOut)
def vote(
    post_id: int,
    data: schemas.VoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not 1 <= data.score <= 5:
        raise HTTPException(status_code=400, detail="Score must be between 1 and 5")

    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(models.Vote).filter(
        models.Vote.user_id == current_user.id,
        models.Vote.post_id == post_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already voted on this post")

    vote = models.Vote(user_id=current_user.id, post_id=post_id, score=data.score)
    db.add(vote)

    # 更新帖子平均分
    post.vote_count += 1
    post.avg_score = ((post.avg_score * (post.vote_count - 1)) + data.score) / post.vote_count

    db.commit()
    return schemas.VoteOut(
        post_id=post_id,
        score=data.score,
        new_avg=post.avg_score,
        vote_count=post.vote_count,
    )
