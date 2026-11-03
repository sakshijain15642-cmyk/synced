# Synced

Real-time collaborative incident board for small teams.

## Status
Work in progress.

## Stack
FastAPI, PostgreSQL, Redis, React + TypeScript, Yjs

## Run locally
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload