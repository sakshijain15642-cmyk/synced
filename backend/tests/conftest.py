import os

# These must be set BEFORE the app is imported, because app.db and
# app.security read their settings when they are first imported.
os.environ.setdefault(
    "TEST_DATABASE_URL",
    "postgresql://synced:synced_dev_password@localhost:5432/synced_test",
)
os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-0123456789")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app import models  # noqa: F401  (registers the tables)
from app.db import Base, engine
from app.main import app

# Safety net: tests delete all data, so never let them run on a real database.
assert engine.url.database.endswith("_test"), (
    f"Refusing to run tests against database {engine.url.database!r}"
)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create the tables once per test run, and remove them at the end."""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def clean_tables():
    """Empty every table before each test so tests can't affect each other."""
    names = ", ".join(table.name for table in Base.metadata.sorted_tables)
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {names} RESTART IDENTITY CASCADE"))
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def make_user(client):
    """Returns a function that signs a user up, logs them in, and gives back auth headers."""

    def _make(email, name="Test User", password="password123"):
        signup = client.post(
            "/auth/signup",
            json={"email": email, "full_name": name, "password": password},
        )
        assert signup.status_code == 201
        login = client.post(
            "/auth/login", data={"username": email, "password": password}
        )
        assert login.status_code == 200
        return {"Authorization": f"Bearer {login.json()['access_token']}"}

    return _make


@pytest.fixture
def alice(make_user):
    return make_user("alice@example.com", "Alice")


@pytest.fixture
def bob(make_user):
    return make_user("bob@example.com", "Bob")


@pytest.fixture
def team_id(client, alice):
    """A team created by Alice (so Alice is a member and Bob is not)."""
    response = client.post("/teams", json={"name": "Platform"}, headers=alice)
    assert response.status_code == 201
    return response.json()["id"]