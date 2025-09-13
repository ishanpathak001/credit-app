# credit-app backend (Node.js + Express + PostgreSQL)


## What this adds
- Express API with endpoints for `credits` and simple `users` table relation.
- PostgreSQL schema (migrations/init.sql).
- Docker Compose to run Postgres + backend locally.


## How to run locally
1. Copy `.env.example` to `.env` and edit if needed.
2. Install dependencies: `npm install`
3. Start Postgres / backend with Docker Compose (recommended):
```bash
docker-compose up --build
```
This will run Postgres on port 5432 and backend on port 4000.


4. Run migrations (if not using docker-compose environment):
```bash
npm run migrate
```


5. Health check:
```bash
curl http://localhost:4000/api/health
```


## Adding to your existing repo
1. Create a new folder at repo root named `backend` and add these files (package.json, src/, migrations/, .env.example, docker-compose.yml, README-backend.md).
2. From the repo root:
```bash
git add backend
git commit -m "chore: add backend (express + postgres)"
git push origin main
```


## Notes & next steps
- Add authentication (JWT) if you need user login.
- Add more tables / foreign keys based on your frontend's data model.
- Add tests and CI workflow.

