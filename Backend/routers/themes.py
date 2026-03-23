from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/themes", tags=["themes"])

@router.get("/", response_model=list[schemas.ThemeOut])
def list_themes(db: Session = Depends(get_db)):
    themes = db.query(models.Theme).order_by(models.Theme.is_official.desc(), models.Theme.created_at.desc()).all()
    result = []
    for t in themes:
        out = schemas.ThemeOut.model_validate(t)
        out.post_count = len(t.posts)
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
    out.post_count = len(theme.posts)
    return out
