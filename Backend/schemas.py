from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: str | None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Posts
class PostCreate(BaseModel):
    theme: str
    image_url: str
    caption: str | None = None

class PostOut(BaseModel):
    id: int
    theme: str
    image_url: str
    caption: str | None
    ai_comment: str | None
    avg_score: float
    vote_count: int
    created_at: datetime
    author: UserOut

    class Config:
        from_attributes = True


# Votes
class VoteCreate(BaseModel):
    score: int  # 1-5

class VoteOut(BaseModel):
    post_id: int
    score: int
    new_avg: float
    vote_count: int
