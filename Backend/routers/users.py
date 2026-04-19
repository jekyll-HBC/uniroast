from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/users", tags=["users"])


def _to_public(user: models.User, current_user: models.User, db: Session) -> schemas.UserPublicOut:
    is_following = db.query(models.Follow).filter_by(
        follower_id=current_user.id, followed_id=user.id
    ).first() is not None
    return schemas.UserPublicOut(
        id=user.id,
        username=user.username,
        avatar_url=user.avatar_url,
        bio=user.bio,
        is_following=is_following,
    )


@router.get("/search", response_model=list[schemas.UserPublicOut])
def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not q.strip():
        return []
    users = (
        db.query(models.User)
        .filter(
            models.User.username.ilike(f"%{q.strip()}%"),
            models.User.id != current_user.id,
        )
        .limit(20)
        .all()
    )
    return [_to_public(u, current_user, db) for u in users]


@router.post("/{user_id}/follow", status_code=204)
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    if not db.query(models.User).filter_by(id=user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    if db.query(models.Follow).filter_by(follower_id=current_user.id, followed_id=user_id).first():
        raise HTTPException(status_code=400, detail="Already following")
    db.add(models.Follow(follower_id=current_user.id, followed_id=user_id))
    db.commit()


@router.delete("/{user_id}/follow", status_code=204)
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    follow = db.query(models.Follow).filter_by(
        follower_id=current_user.id, followed_id=user_id
    ).first()
    if not follow:
        raise HTTPException(status_code=404, detail="Not following")
    db.delete(follow)
    db.commit()


@router.get("/{user_id}/following", response_model=list[schemas.UserPublicOut])
def get_following(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    follows = db.query(models.Follow).filter_by(follower_id=user_id).all()
    users = [db.get(models.User, f.followed_id) for f in follows]
    return [_to_public(u, current_user, db) for u in users if u]


@router.get("/{user_id}/followers", response_model=list[schemas.UserPublicOut])
def get_followers(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    follows = db.query(models.Follow).filter_by(followed_id=user_id).all()
    users = [db.get(models.User, f.follower_id) for f in follows]
    return [_to_public(u, current_user, db) for u in users if u]
