from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, date

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
    streak: int | None = None

    @field_validator("streak", mode="before")
    @classmethod
    def coerce_streak(cls, v):
        return v if v is not None else 0

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Themes
class ThemeCreate(BaseModel):
    title: str
    emoji: str = "🔥"
    description: str | None = None
    active_date: date | None = None

class ThemeOut(BaseModel):
    id: int
    title: str
    emoji: str
    description: str | None
    is_official: bool
    active_date: date | None = None
    creator: UserOut | None
    post_count: int = 0

    class Config:
        from_attributes = True


# Posts
TIER_THRESHOLDS = [
    (4.5, "夯"),
    (3.5, "顶级"),
    (2.5, "人上人"),
    (1.5, "NPC"),
    (0.0, "拉完了"),
]

def score_to_tier(avg: float, vote_count: int) -> str:
    if vote_count == 0:
        return "未评级"
    for threshold, label in TIER_THRESHOLDS:
        if avg >= threshold:
            return label
    return "拉完了"

class PostCreate(BaseModel):
    theme_id: int
    image_url: str
    caption: str | None = None

class PostOut(BaseModel):
    id: int
    theme_id: int
    image_url: str
    caption: str | None
    ai_comment: str | None
    avg_score: float
    vote_count: int
    tier: str = "未评级"
    created_at: datetime
    author: UserOut

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_tier(cls, post):
        obj = cls.model_validate(post)
        obj.tier = score_to_tier(post.avg_score, post.vote_count)
        return obj


# Votes
class VoteCreate(BaseModel):
    score: int  # 1-5 (夯=5, 顶级=4, 人上人=3, NPC=2, 拉完了=1)

class VoteOut(BaseModel):
    post_id: int
    score: int
    new_avg: float
    vote_count: int
    tier: str


# Activity
class ActivityOut(BaseModel):
    id: int
    post_id: int
    new_vote_count: int
    new_tier: str
    created_at: datetime
    post_image_url: str
    post_caption: str | None

    class Config:
        from_attributes = True


# Season
class SeasonOut(BaseModel):
    id: int
    number: int
    start_date: date
    end_date: date
    is_active: bool

    class Config:
        from_attributes = True

class SeasonSnapshotOut(BaseModel):
    rank: int
    avg_score: float
    vote_count: int
    tier: str
    post: PostOut

    class Config:
        from_attributes = True
