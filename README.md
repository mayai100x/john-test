# 🧪 John Test

Test repo for validating coder agent (John) output. Monorepo with React frontend + Express TypeScript API.

## Architecture

```
john-test/
├── packages/
│   ├── api/              Express TypeScript backend (port 4000)
│   │   └── src/
│   │       ├── index.ts          App factory + entrypoint
│   │       ├── routes/           health, items (CRUD)
│   │       └── middleware/       error handling, request logging
│   └── web/              React + Vite frontend (port 3000)
│       └── src/
│           ├── api/client.ts     Typed fetch wrappers
│           ├── pages/Home.tsx    Main page with CRUD UI
│           └── index.css         Dark theme (GitHub-inspired)
├── docker-compose.yml    Full stack orchestration
├── Dockerfile.api        API container
└── Dockerfile.web        Web container
```

## Quick Start

```bash
# Install everything
npm install

# Run both in dev mode
npm run dev:api &   # http://localhost:4000
npm run dev:web     # http://localhost:3000
```

Or with Docker:

```bash
docker compose up -d --build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/items` | List all items |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create item `{name, description}` |
| DELETE | `/api/items/:id` | Delete item |

## Tech Stack

- **Frontend:** React 18, Vite 5, TypeScript
- **Backend:** Express 4, TypeScript, tsx (dev runner)
- **Infra:** Docker Compose, npm workspaces
