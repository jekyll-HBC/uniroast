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


# ── users / follow ────────────────────────────────────────────────────────────

def _register_bob(client):
    return client.post("/auth/register", json={
        "username": "bob", "email": "bob@test.com", "password": "TestPass123!"
    })

def _bob_header(client):
    r = client.post("/auth/login", json={"email": "bob@test.com", "password": "TestPass123!"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_search_users(client):
    register(client)
    _register_bob(client)
    r = client.get("/users/search?q=bob", headers=auth_header(client))
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["username"] == "bob"
    assert data[0]["is_following"] is False


def test_search_excludes_self(client):
    register(client)
    r = client.get("/users/search?q=alice", headers=auth_header(client))
    assert r.status_code == 200
    assert len(r.json()) == 0


def test_follow_and_unfollow(client):
    register(client)
    bob_r = _register_bob(client)
    bob_id = client.get("/auth/me", headers=_bob_header(client)).json()["id"]

    # follow
    r = client.post(f"/users/{bob_id}/follow", headers=auth_header(client))
    assert r.status_code == 204

    # following list
    alice_id = client.get("/auth/me", headers=auth_header(client)).json()["id"]
    r = client.get(f"/users/{alice_id}/following", headers=auth_header(client))
    assert any(u["id"] == bob_id for u in r.json())

    # followers list
    r = client.get(f"/users/{bob_id}/followers", headers=auth_header(client))
    assert any(u["id"] == alice_id for u in r.json())

    # is_following flag in search
    r = client.get("/users/search?q=bob", headers=auth_header(client))
    assert r.json()[0]["is_following"] is True

    # unfollow
    r = client.delete(f"/users/{bob_id}/follow", headers=auth_header(client))
    assert r.status_code == 204

    r = client.get(f"/users/{alice_id}/following", headers=auth_header(client))
    assert len(r.json()) == 0


def test_follow_duplicate(client):
    register(client)
    _register_bob(client)
    bob_id = client.get("/auth/me", headers=_bob_header(client)).json()["id"]
    client.post(f"/users/{bob_id}/follow", headers=auth_header(client))
    r = client.post(f"/users/{bob_id}/follow", headers=auth_header(client))
    assert r.status_code == 400


def test_follow_self(client):
    register(client)
    alice_id = client.get("/auth/me", headers=auth_header(client)).json()["id"]
    r = client.post(f"/users/{alice_id}/follow", headers=auth_header(client))
    assert r.status_code == 400


def test_unfollow_not_following(client):
    register(client)
    _register_bob(client)
    bob_id = client.get("/auth/me", headers=_bob_header(client)).json()["id"]
    r = client.delete(f"/users/{bob_id}/follow", headers=auth_header(client))
    assert r.status_code == 404


# ── auth: update_me & activity ────────────────────────────────────────────────

def test_update_me(client):
    register(client)
    headers = auth_header(client)
    r = client.patch("/auth/me", json={"bio": "hello world"}, headers=headers)
    assert r.status_code == 200
    assert r.json()["bio"] == "hello world"


def test_update_me_username(client):
    register(client)
    headers = auth_header(client)
    r = client.patch("/auth/me", json={"username": "alice2"}, headers=headers)
    assert r.status_code == 200
    assert r.json()["username"] == "alice2"


def test_update_me_unauthenticated(client):
    r = client.patch("/auth/me", json={"bio": "x"})
    assert r.status_code == 401


def test_my_activity_empty(client):
    register(client)
    r = client.get("/auth/me/activity", headers=auth_header(client))
    assert r.status_code == 200
    assert r.json() == []


def test_my_activity_after_vote(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        post_id = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers).json()["id"]
    # vote on own post to trigger activity
    client.post(f"/posts/{post_id}/vote", json={"vote_type": "heng"}, headers=headers)
    r = client.get("/auth/me/activity", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["post_id"] == post_id


# ── posts: get single, list filters, la vote, streak ─────────────────────────

def test_get_post(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="roast")):
        post_id = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers).json()["id"]
    r = client.get(f"/posts/{post_id}")
    assert r.status_code == 200
    assert r.json()["id"] == post_id


def test_get_post_not_found(client):
    r = client.get("/posts/9999")
    assert r.status_code == 404


def test_list_posts_filter_by_user(client):
    register(client)
    headers = auth_header(client)
    user_id = client.get("/auth/me", headers=headers).json()["id"]
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers)
    r = client.get(f"/posts/?user_id={user_id}")
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_list_posts_filter_by_theme(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers)
    r = client.get(f"/posts/?theme_id={theme_id}")
    assert r.status_code == 200
    assert all(p["theme_id"] == theme_id for p in r.json())


def test_vote_la(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        post_id = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers).json()["id"]
    r = client.post(f"/posts/{post_id}/vote", json={"vote_type": "la"}, headers=headers)
    assert r.status_code == 200
    assert r.json()["vote_count"] == 1
    assert r.json()["heng_count"] == 0
    assert r.json()["la_count"] == 1


def test_vote_nonexistent_post(client):
    register(client)
    r = client.post("/posts/9999/vote", json={"vote_type": "heng"}, headers=auth_header(client))
    assert r.status_code == 404


def test_streak_increments_on_consecutive_posts(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers)
    me = client.get("/auth/me", headers=headers).json()
    assert me["streak"] >= 1


# ── schemas: score_to_tier ────────────────────────────────────────────────────

def test_score_to_tier():
    from schemas import score_to_tier
    assert score_to_tier(0.0, 0) == "未评级"
    assert score_to_tier(1.0, 3) == "夯"       # 3/3 = 100%
    assert score_to_tier(0.75, 4) == "顶级"    # 3/4 = 75%
    assert score_to_tier(0.5, 4) == "人上人"   # 2/4 = 50%
    assert score_to_tier(0.25, 4) == "NPC"     # 1/4 = 25%
    assert score_to_tier(0.0, 4) == "拉完了"   # 0/4 = 0%


# ── themes: list today filter, theme posts ────────────────────────────────────

def test_list_themes_today_filter(client):
    register(client)
    headers = auth_header(client)
    from datetime import date
    today = date.today().isoformat()
    client.post("/themes/", json={"title": "Today Theme", "emoji": "📅", "active_date": today}, headers=headers)
    client.post("/themes/", json={"title": "Other Theme", "emoji": "🔥"}, headers=headers)
    r = client.get("/themes/?today=true")
    assert r.status_code == 200
    titles = [t["title"] for t in r.json()]
    assert "Today Theme" in titles
    assert "Other Theme" not in titles


def test_theme_posts(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers)
    r = client.get(f"/themes/{theme_id}/posts")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["theme_id"] == theme_id


def test_theme_posts_not_found(client):
    r = client.get("/themes/9999/posts")
    assert r.status_code == 404


# ── seasons ───────────────────────────────────────────────────────────────────

def test_current_season(client):
    r = client.get("/seasons/current")
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert "number" in data
    assert data["is_active"] is True


def test_current_season_idempotent(client):
    """Calling /seasons/current twice returns the same season"""
    r1 = client.get("/seasons/current")
    r2 = client.get("/seasons/current")
    assert r1.json()["id"] == r2.json()["id"]


def test_current_leaderboard_empty(client):
    r = client.get("/seasons/current/leaderboard")
    assert r.status_code == 200
    assert r.json() == []


def test_current_leaderboard_with_voted_post(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        post_id = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers).json()["id"]
    client.post(f"/posts/{post_id}/vote", json={"vote_type": "heng"}, headers=headers)
    r = client.get("/seasons/current/leaderboard")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["rank"] == 1


def test_season_history(client):
    client.get("/seasons/current")  # ensure at least one season exists
    r = client.get("/seasons/history")
    assert r.status_code == 200
    assert len(r.json()) >= 1


# ── feed ──────────────────────────────────────────────────────────────────────

def test_feed_empty(client):
    r = client.get("/posts/feed")
    assert r.status_code == 200
    assert r.json() == []


def test_feed_returns_posts(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers)
    r = client.get("/posts/feed")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert "theme_title" in r.json()[0]


# ── streak consecutive day branch (posts.py:70-71) ────────────────────────────

def test_streak_increments_on_second_consecutive_day(client):
    """Second post on a different day increments streak via the elif branch"""
    import datetime
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)

    yesterday = datetime.date.today() - datetime.timedelta(days=1)

    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers)

    from database import get_db as _get_db
    from tests.conftest import _TestingSession
    db = _TestingSession()
    from main import app as _app
    import models as _models
    me = client.get("/auth/me", headers=headers).json()
    user = db.query(_models.User).filter_by(id=me["id"]).first()
    user.last_post_date = yesterday
    user.streak = 1
    db.commit()
    db.close()

    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        r = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/2.jpg"}, headers=headers)
    assert r.status_code == 201
    me2 = client.get("/auth/me", headers=headers).json()
    assert me2["streak"] == 2


# ── seasons/{id}/leaderboard (seasons.py:64-71) ───────────────────────────────

def test_season_leaderboard_by_id(client):
    """GET /seasons/{id}/leaderboard returns empty list for fresh season (no snapshots)"""
    season = client.get("/seasons/current").json()
    r = client.get(f"/seasons/{season['id']}/leaderboard")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ── users following list + is_following flag (users.py:30, 52) ───────────────

def test_get_following_list(client):
    """GET /users/{id}/following returns list of users being followed"""
    register(client)
    headers = auth_header(client)

    client.post("/auth/register", json={"username": "bob2", "email": "bob2@test.com", "password": "TestPass123!"})
    r2 = client.post("/auth/login", json={"email": "bob2@test.com", "password": "TestPass123!"})
    bob_id = client.get("/auth/me", headers={"Authorization": f"Bearer {r2.json()['access_token']}"}).json()["id"]

    client.post(f"/users/{bob_id}/follow", headers=headers)

    me = client.get("/auth/me", headers=headers).json()
    r = client.get(f"/users/{me['id']}/following", headers=headers)
    assert r.status_code == 200
    ids = [u["id"] for u in r.json()]
    assert bob_id in ids


def test_get_followers_list(client):
    """GET /users/{id}/followers returns list of users who follow me"""
    register(client)
    headers = auth_header(client)

    client.post("/auth/register", json={"username": "carol", "email": "carol@test.com", "password": "TestPass123!"})
    r3 = client.post("/auth/login", json={"email": "carol@test.com", "password": "TestPass123!"})
    carol_headers = {"Authorization": f"Bearer {r3.json()['access_token']}"}
    carol_id = client.get("/auth/me", headers=carol_headers).json()["id"]

    me = client.get("/auth/me", headers=headers).json()
    client.post(f"/users/{me['id']}/follow", headers=carol_headers)

    r = client.get(f"/users/{me['id']}/followers", headers=headers)
    assert r.status_code == 200
    ids = [u["id"] for u in r.json()]
    assert carol_id in ids


def test_search_shows_is_following_true(client):
    """GET /users/search returns is_following=True for followed users"""
    register(client)
    headers = auth_header(client)

    client.post("/auth/register", json={"username": "uniquefollowable", "email": "uf@test.com", "password": "TestPass123!"})
    r2 = client.post("/auth/login", json={"email": "uf@test.com", "password": "TestPass123!"})
    uf_id = client.get("/auth/me", headers={"Authorization": f"Bearer {r2.json()['access_token']}"}).json()["id"]

    client.post(f"/users/{uf_id}/follow", headers=headers)

    r = client.get("/users/search?q=uniquefollowable", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["is_following"] is True
