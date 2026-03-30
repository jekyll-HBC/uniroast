from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import get_current_user
from ai_service import generate_roast
import models, schemas

router = APIRouter(prefix="/posts", tags=["posts"])


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
    if not 1 <= data.score <= 5:
        raise HTTPException(status_code=400, detail="Score must be between 1 and 5")

    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.add(models.Vote(user_id=current_user.id, post_id=post_id, score=data.score))

    result = db.query(
        func.count(models.Vote.id),
        func.avg(models.Vote.score),
    ).filter(models.Vote.post_id == post_id).one()
    new_count = (result[0] or 0) + 1
    new_avg = ((result[1] or 0) * (result[0] or 0) + data.score) / new_count

    post.vote_count = new_count
    post.avg_score = new_avg

    db.commit()
    return schemas.VoteOut(
        post_id=post_id,
        score=data.score,
        new_avg=new_avg,
        vote_count=new_count,
        tier=schemas.score_to_tier(new_avg, new_count),
    )
