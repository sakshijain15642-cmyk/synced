import os

import psycopg
from fastapi import FastAPI

from app.routers import auth, incidents, teams
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Synced API")
cors_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(incidents.router)

DATABASE_URL = os.getenv("DATABASE_URL")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/db")
def health_db():
    with psycopg.connect(DATABASE_URL) as conn:
        row = conn.execute("SELECT 1").fetchone()
    return {"database": "ok", "result": row[0]}