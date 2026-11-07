from sqlalchemy import select

from app.db import SessionLocal
from app.models import User

SIGNUP = {
    "email": "alice@example.com",
    "full_name": "Alice",
    "password": "password123",
}


def test_signup_returns_user_without_password(client):
    response = client.post("/auth/signup", json=SIGNUP)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert "password" not in body
    assert "hashed_password" not in body


def test_password_is_stored_hashed(client):
    client.post("/auth/signup", json=SIGNUP)
    with SessionLocal() as db:
        user = db.scalar(select(User))
    assert user.hashed_password != SIGNUP["password"]
    assert user.hashed_password.startswith("$argon2")


def test_duplicate_email_is_rejected_even_with_different_case(client):
    assert client.post("/auth/signup", json=SIGNUP).status_code == 201
    shouting = {**SIGNUP, "email": "ALICE@EXAMPLE.COM"}
    assert client.post("/auth/signup", json=shouting).status_code == 409


def test_short_password_is_rejected(client):
    weak = {**SIGNUP, "password": "short"}
    assert client.post("/auth/signup", json=weak).status_code == 422


def test_wrong_password_and_unknown_email_look_identical(client, alice):
    wrong_password = client.post(
        "/auth/login", data={"username": "alice@example.com", "password": "nope-nope-1"}
    )
    unknown_email = client.post(
        "/auth/login", data={"username": "nobody@example.com", "password": "password123"}
    )
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


def test_me_returns_the_logged_in_user(client, alice):
    response = client.get("/auth/me", headers=alice)
    assert response.status_code == 200
    assert response.json()["email"] == "alice@example.com"


def test_me_rejects_missing_and_garbage_tokens(client):
    assert client.get("/auth/me").status_code == 401
    garbage = {"Authorization": "Bearer not-a-real-token"}
    assert client.get("/auth/me", headers=garbage).status_code == 401