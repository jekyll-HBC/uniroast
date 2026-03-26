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
    r = client.post(f"/posts/{post_id}/vote", json={"score": 5}, headers=headers)
    assert r.status_code == 200
    assert r.json()["vote_count"] == 1
    assert r.json()["new_avg"] == 5.0


def test_vote_invalid_score(client):
    register(client)
    headers = auth_header(client)
    theme_id = _create_theme(client, headers)
    with patch("routers.posts.generate_roast", new=AsyncMock(return_value="")):
        post_id = client.post("/posts/", json={"theme_id": theme_id, "image_url": "http://img.test/1.jpg"}, headers=headers).json()["id"]
    r = client.post(f"/posts/{post_id}/vote", json={"score": 10}, headers=headers)
    assert r.status_code == 400


# ── schemas unit tests ────────────────────────────────────────────────────────

def test_score_to_tier():
    from schemas import score_to_tier
    assert score_to_tier(0, 0) == "未评级"
    assert score_to_tier(4.8, 3) == "夯"
    assert score_to_tier(3.8, 3) == "顶级"
    assert score_to_tier(2.8, 3) == "人上人"
    assert score_to_tier(1.8, 3) == "NPC"
    assert score_to_tier(1.0, 3) == "拉完了"
