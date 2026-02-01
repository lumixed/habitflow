# HabitFlow

A habit tracking and accountability app. Build habits, stay accountable with friends, track your streaks.

## Tech Stack

- **Frontend** — Next.js 14, React, Tailwind CSS
- **Backend** — Node.js, Express, TypeScript
- **Database** — PostgreSQL via Prisma
- **Docker** — All services run locally with Docker Compose

## Getting Started

Make sure [Docker Desktop](https://docs.docker.com/get-docker/) is installed and running.

```bash
git clone <your-repo-url>
cd habitflow
docker compose up --build
```

Then in a second terminal, run the database migration:

```bash
docker compose exec backend npx prisma migrate dev --name init
```

That's it. The app is running:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/health
