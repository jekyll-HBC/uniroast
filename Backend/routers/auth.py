from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(
        (models.User.email == data.email) | (models.User.username == data.username)
    ).first():
        raise HTTPException(status_code=400, detail="Email or username already exists")

    user = models.User(
        username=data.username,
        email=data.email,
        hashed_password=auth.hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": auth.create_access_token(user.id)}

@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": auth.create_access_token(user.id)}

@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.get("/me/activity", response_model=list[schemas.ActivityOut])
def my_activity(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    activities = (
        db.query(models.PostActivity)
        .filter(models.PostActivity.post_owner_id == current_user.id)
        .order_by(models.PostActivity.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        schemas.ActivityOut(
            id=a.id,
            post_id=a.post_id,
            new_vote_count=a.new_vote_count,
            new_tier=a.new_tier,
            created_at=a.created_at,
            post_image_url=a.post.image_url,
            post_caption=a.post.caption,
        )
        for a in activities
    ]
