from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Literal

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
    streak: int | None = 0

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
    (0.92, "夯"),
    (0.75, "顶级"),
    (0.50, "人上人"),
    (0.25, "NPC"),
]

def ratio_to_tier(heng_count: int, total_votes: int) -> str:
    if total_votes < 3:
        return "未评级"
    rate = heng_count / total_votes
    for threshold, label in TIER_THRESHOLDS:
        if rate >= threshold:
            return label
    return "拉完了"

# Keep for backward compatibility with existing season data
def score_to_tier(avg: float, vote_count: int) -> str:
    return ratio_to_tier(int(round(avg * vote_count)), vote_count)

class PostCreate(BaseModel):
    theme_id: int
    image_url: str
    caption: str | None = None

class PostOut(BaseModel):
    id: int
    theme_id: int
    image_url: str
    images: list[str] = []
    caption: str | None
    ai_comment: str | None
    avg_score: float        # stores heng_rate (0.0–1.0)
    vote_count: int
    heng_count: int = 0
    la_count: int = 0
    tier: str = "未评级"
    created_at: datetime
    author: UserOut

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_tier(cls, post):
        obj = cls.model_validate(post)
        obj.images = [post.image_url] if post.image_url else []
        obj.la_count = obj.vote_count - obj.heng_count
        obj.tier = ratio_to_tier(obj.heng_count, obj.vote_count)
        return obj


class FeedPostOut(PostOut):
    theme_title: str = ""
    theme_emoji: str = "🔥"

    @classmethod
    def from_orm_with_tier(cls, post):
        obj = cls.model_validate(post)
        obj.images = [post.image_url] if post.image_url else []
        obj.la_count = obj.vote_count - obj.heng_count
        obj.tier = ratio_to_tier(obj.heng_count, obj.vote_count)
        if post.theme_obj:
            obj.theme_title = post.theme_obj.title
            obj.theme_emoji = post.theme_obj.emoji
        return obj


# Votes
class VoteCreate(BaseModel):
    vote_type: Literal["heng", "la"]

class VoteOut(BaseModel):
    post_id: int
    vote_type: str
    heng_count: int
    la_count: int
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
