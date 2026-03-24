from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, UniqueConstraint, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author")
    votes = relationship("Vote", back_populates="voter")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    image_url = Column(String, nullable=False)
    caption = Column(String(300), nullable=True)
    ai_comment = Column(String, nullable=True)
    avg_score = Column(Float, default=0.0)
    vote_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", back_populates="posts")
    theme_obj = relationship("Theme", back_populates="posts")
    votes = relationship("Vote", back_populates="post")


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    emoji = Column(String(10), nullable=False, default="🔥")
    description = Column(String(200), nullable=True)
    is_official = Column(Boolean, default=False)
    active_date = Column(Date, nullable=True)  # 设置后该主题在指定日期显示为"今日主题"
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("User", foreign_keys=[creator_id])
    posts = relationship("Post", back_populates="theme_obj")


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_user_post_vote"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    score = Column(Integer, nullable=False)           # 1-5

    voter = relationship("User", back_populates="votes")
    post = relationship("Post", back_populates="votes")
