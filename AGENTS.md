# AGENTS.md

## Project Overview

**OpenPAD (Open Prompt Aided Design)** generates OpenSCAD 3D model code from natural language prompts using AI. Features include instant Three.js 3D preview, STL export, and multiple AI backend support.

## Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Backend:** Node.js + TypeScript (Fastify)
- **Container:** Docker Compose v2 (no legacy `docker-compose` syntax)
- **AI Backends:** Google Gemini, OpenAI, Ollama, OpenRouter, Custom OpenAI-compatible

## Build Commands

```bash
# Frontend
pnpm run dev     # Start dev server
pnpm run test    # Run tests (Vitest)
pnpm run lint    # Lint code
pnpm run build   # Production build

# Backend
cd packages/backend && pnpm run dev

# Docker
docker compose --profile dev up --build   # Development
docker compose --profile production up   # Production
docker compose logs -f                    # View logs
docker compose down                       # Stop containers
```

## Code Standards

- Strict TypeScript with strict null checks
- ESLint + Prettier formatting
- Minimum 80% test coverage
- All tests must pass before PR
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`

## File Structure

```
├── packages/
│   ├── frontend/     # React/Vite/TypeScript app
│   └── backend/     # Fastify/TypeScript API
├── docker-compose.yml
├── .env.example
└── package.json     # Workspace root
```

## Testing Notes

- Frontend: Vitest with jsdom
- Backend: Jest + Supertest
- `jsdom` limitations: mock `window.matchMedia`, `ResizeObserver` as needed
- `@react-three/fiber` components require e2e testing (Playwright/Cypress) - not unit testable in jsdom

## Relevant Files

- [README.md](README.md) - Feature overview and getting started
- [TODO.md](TODO.md) - Future work tracking
- [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) - Human contributor guidelines
