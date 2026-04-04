"""
Integration tests for UniRoast API using SQLite.
DB setup is handled by tests/conftest.py.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from database import get_db
from main import app
from tests.conftest import _TestingSession


@pytest.fixture
def client():
    def override_get_db():
        db = _TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── helpers ───────────────────────────────────────────────────────────────────

def register(client, username="alice", email="alice@test.com", password="TestPass123!"):
    return client.post("/auth/register", json={"username": username, "email": email, "password": password})


def auth_header(client, email="alice@test.com", password="TestPass123!"):
    r = client.post("/auth/login", json={"email": email, "password": password})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


# ── root ──────────────────────────────────────────────────────────────────────

def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "UniRoast" in r.json()["message"]


# ── auth ──────────────────────────────────────────────────────────────────────

def test_register(client):
    r = register(client)
    assert r.status_code == 201
    assert "access_token" in r.json()


def test_register_duplicate(client):
    register(client)
    r = register(client)
    assert r.status_code == 400


def test_login(client):
    register(client)
    r = client.post("/auth/login", json={"email": "alice@test.com", "password": "TestPass123!"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    register(client)
    r = client.post("/auth/login", json={"email": "alice@test.com", "password": "wrong"})
    assert r.status_code == 401


def test_me(client):
    register(client)
    r = client.get("/auth/me", headers=auth_header(client))
    assert r.status_code == 200
    assert r.json()["username"] == "alice"


def test_me_unauthenticated(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


# ── themes ────────────────────────────────────────────────────────────────────

def test_list_themes_empty(client):
    r = client.get("/themes/")
    assert r.status_code == 200
    assert r.json() == []


def test_create_and_get_theme(client):
    register(client)
    headers = auth_header(client)
    r = client.post("/themes/", json={"title": "Worst Meal", "emoji": "🍱"}, headers=headers)
    assert r.status_code == 201
    theme_id = r.json()["id"]

    r2 = client.get(f"/themes/{theme_id}")
    assert r2.status_code == 200
    assert r2.json()["title"] == "Worst Meal"


def test_get_theme_not_found(client):
    r = client.get("/themes/999")
    assert r.status_code == 404


# ── posts ─────────────────────────────────────────────────────────────────────

def _create_theme(client, headers):
    r = client.post("/themes/", json={"title": "Test Theme", "emoji": "🔥"}, headers=headers)
    return r.json()["id"]


def test_create_post(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="Nice roast!")):
        r = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg", "caption": "hi"}, headers=headers)
    assert r.status_code == 201
    assert r.json()["ai_comment"] == "Nice roast!"


def test_create_post_invalid_theme(client):
    register(client)
    headers = auth_header(client)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        r = client.post("/posts/", json={"theme_id": 999, "image_url": "http://img.test/1.jpg"}, headers=headers)
    assert r.status_code == 404


def test_list_posts(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers)
    r = client.get("/posts/")
    assert r.status_code == 200
    assert len(r.json()) == 1


# ── votes ─────────────────────────────────────────────────────────────────────

def test_vote(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        post_id = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers).json()["id"]
    r = client.post(f"/posts/{post_id}/vote", json={"vote_type": "heng"}, headers=headers)
    assert r.status_code == 200
    assert r.json()["vote_count"] == 1
    assert r.json()["heng_count"] == 1
    assert r.json()["tier"] == "未评级"  # < 3 votes threshold


def test_vote_invalid_type(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        post_id = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers).json()["id"]
    r = client.post(f"/posts/{post_id}/vote", json={"vote_type": "invalid"}, headers=headers)
    assert r.status_code == 422


# ── schemas unit tests ────────────────────────────────────────────────────────

def test_ratio_to_tier():
    from schemas import ratio_to_tier
    assert ratio_to_tier(0, 0) == "未评级"
    assert ratio_to_tier(1, 2) == "未评级"   # < 3 votes
    assert ratio_to_tier(3, 3) == "夯"        # 100% heng ≥ 92%
    assert ratio_to_tier(3, 4) == "顶级"      # 75%
    assert ratio_to_tier(2, 4) == "人上人"    # 50%
    assert ratio_to_tier(1, 4) == "NPC"       # 25%
    assert ratio_to_tier(0, 4) == "拉完了"    # 0%


# ── end-to-end flow ───────────────────────────────────────────────────────────

def test_full_user_journey(client):
    """E2E: 注册 → 登录 → 创建主题 → 发帖（含AI吐槽）→ 投票 → 排行榜"""
    # 1. 注册
    r = client.post("/auth/register", json={
        "username": "e2e_user", "email": "e2e@test.com", "password": "E2ePass123!"
    })
    assert r.status_code == 201
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

    # 2. 验证登录状态
    me = client.get("/auth/me", headers=headers)
    assert me.json()["username"] == "e2e_user"

    # 3. 创建主题
    theme = client.post("/themes/", json={"title": "最尴尬的一刻", "emoji": "😬"}, headers=headers)
    assert theme.status_code == 201
    theme_id = theme.json()["id"]

    # 4. 发帖（mock AI 避免真实 API 调用）
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="这照片让我笑出声了")):
        post = client.post("/posts/", json={
            "theme_id": theme_id,
            "image_url": "https://example.com/photo.jpg",
            "caption": "我在食堂摔了一跤"
        }, headers=headers)
    assert post.status_code == 201
    post_id = post.json()["id"]
    assert post.json()["ai_comment"] == "这照片让我笑出声了"

    # 5. 投票
    vote = client.post(f"/posts/{post_id}/vote", json={"vote_type": "heng"}, headers=headers)
    assert vote.status_code == 200
    assert vote.json()["heng_count"] == 1

    # 6. 排行榜：帖子出现
    leaderboard = client.get("/posts/")
    posts = leaderboard.json()
    assert any(p["id"] == post_id for p in posts)
