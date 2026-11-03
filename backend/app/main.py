import os

import psycopg
from fastapi import FastAPI

app = FastAPI(title="Synced API")

DATABASE_URL = os.getenv("DATABASE_URL")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/db")
def health_db():
    with psycopg.connect(DATABASE_URL) as conn:
        row = conn.execute("SELECT 1").fetchone()
    return {"database": "ok", "result": row[0]}