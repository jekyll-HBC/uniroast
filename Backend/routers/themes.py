from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from auth import get_current_user
import models, schemas
from datetime import date

router = APIRouter(prefix="/themes", tags=["themes"])

@router.get("/", response_model=list[schemas.ThemeOut])
def list_themes(today: bool = False, db: Session = Depends(get_db)):
    post_counts = dict(
        db.query(models.Post.theme_id, func.count(models.Post.id))
        .group_by(models.Post.theme_id)
        .all()
    )
    q = db.query(models.Theme)
    if today:
        q = q.filter(models.Theme.active_date == date.today())
    else:
        q = q.order_by(models.Theme.is_official.desc(), models.Theme.created_at.desc())
    result = []
    for t in q.all():
        out = schemas.ThemeOut.model_validate(t)
        out.post_count = post_counts.get(t.id, 0)
        result.append(out)
    return result

@router.post("/", response_model=schemas.ThemeOut, status_code=201)
def create_theme(
    data: schemas.ThemeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    theme = models.Theme(**data.model_dump(), creator_id=current_user.id)
    db.add(theme)
    db.commit()
    db.refresh(theme)
    out = schemas.ThemeOut.model_validate(theme)
    out.post_count = 0
    return out

@router.get("/{theme_id}", response_model=schemas.ThemeOut)
def get_theme(theme_id: int, db: Session = Depends(get_db)):
    theme = db.query(models.Theme).filter(models.Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    out = schemas.ThemeOut.model_validate(theme)
    out.post_count = db.query(func.count(models.Post.id)).filter(models.Post.theme_id == theme_id).scalar()
    return out


@router.get("/{theme_id}/posts", response_model=list[schemas.FeedPostOut])
def theme_posts(theme_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """主题帖子信息流（贴吧式，按热度排序）"""
    theme = db.query(models.Theme).filter(models.Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    posts = (
        db.query(models.Post)
        .options(joinedload(models.Post.author), joinedload(models.Post.theme_obj))
        .filter(models.Post.theme_id == theme_id)
        .order_by(models.Post.avg_score.desc(), models.Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [schemas.FeedPostOut.from_orm_with_tier(p) for p in posts]
