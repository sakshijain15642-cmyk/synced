# Synced

Real-time collaborative incident board for small teams.

## Status
Week 2 complete: sign up and log in, teams, incident list with filters and pagination, incident detail, create and update incidents. Real-time features are next.

## Stack
FastAPI, PostgreSQL, Redis, React + TypeScript, Yjs

## Run locally
Requires Docker Desktop.

    docker compose up --build

## Run tests
Requires Docker running (for Postgres) and a `synced_test` database:

    docker compose up -d
    docker compose exec db psql -U synced -d synced -c "CREATE DATABASE synced_test;"
    cd backend
    pytest -v

## Run the frontend
Requires Node.js 20+.

    cd frontend
    npm install
    npm run dev

App: http://localhost:5173

API: http://127.0.0.1:8000/docs