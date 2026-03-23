from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models, schemas
from datetime import datetime, timezone

router = APIRouter(prefix="/themes", tags=["themes"])


@router.get("/today", response_model=schemas.ThemeOut)
def get_today_theme(db: Session = Depends(get_db)):
    today = datetime.now(timezone.utc).date()
    theme = db.query(models.Theme).filter(
        func.date(models.Theme.date) == today
    ).first()
    if not theme:
        raise HTTPException(status_code=404, detail="No theme set for today")
    return theme
