# AGENTS.md

## Current Status: MVP Complete

## General Directives
- **Documentation Maintenance:** After any change to the codebase, features, or project status, you MUST review and update the README.md and TODO.md files to reflect these changes accurately.

The Minimum Viable Product (MVP) is functional. The following core features have been implemented:
- Natural language prompt to OpenSCAD code generation via Google Gemini.
- Live 3D preview of the generated model using Three.js and STL conversion.
- Fully containerized development environment using Docker Compose.
- Monorepo structure with a React/Vite/TypeScript frontend and a Node.js/Fastify/TypeScript backend.

## Project Overview
**OpenPAD (Open Prompt Aided Design)** is a modern web app to generate OpenSCAD 3D model code from natural language via Google Gemini 2.5. Core features include prompt-driven code generation, instant Three.js preview, STL export, and a strong focus on Docker deployment and robust testing.

## Coding Agent Setup
- **Use Vite + React + TypeScript** for frontend tasks.
- **Node.js + TypeScript (Fastify)** for backend API, following strict typing.
- **Modern Docker Compose** (v2, space syntax)—do not use the deprecated dash format (`docker-compose`).
- **Google Gemini 2.5** is the sole priority backend; other AI backends are tracked in TODO.md and not required for MVP.

## Dev Environment Tips
- Use `pnpm`, `npm`, or `yarn` per package.json scripts—pnpm recommended for workspace speed.
- For new React+Vite+TS frontend:  
  `pnpm create vite@latest <frontend_name> -- --template react-ts`
- For backend TypeScript:  
  `pnpm init` or `npm init`, then install fastify, zod, @fastify/helmet.

## Build & Test Commands
- **Frontend:**  
  - Dev: `pnpm run dev`  
  - Test: `pnpm run test` (Vitest)
  - Lint: `pnpm run lint`
- **Backend:**  
  - Dev: `pnpm run dev`
  - Test: `pnpm run test` (Jest + Supertest)
  - Lint: `pnpm run lint`
- **Container:**  
  - Build & Run Dev: `docker compose --profile dev up --build`
  - Development: `docker compose --profile dev up -d`
  - Production: `docker compose --profile production up -d`
  - Logs: `docker compose logs -f`
  - Stop: `docker compose down`

## VSCode/IDE Conventions
- Use Prettier, ESLint, and recommended TypeScript strict configs.
- Format on save should be active.
- Full code navigation, auto-complete, and type-checking required.

## Security/Testing/CI Policy
- All PRs must pass `pnpm lint` and `pnpm test` (TypeScript/ESLint/Vitest/Jest).
- Minimum test coverage is 80% (`pnpm run test:coverage`).
- Security best practices:
  - Use Helmet, CORS, rate limiting in backend.
  - Do not log or expose API keys.
  - Only accept Google Gemini API for MVP.
- CI: See `.github/workflows/` and ensure all checks are green before merging.

## Core Goals (Priority Items)
- Natural language → OpenSCAD code via Google Gemini (with configurable models: Gemini 2.5 Flash/Pro).
- 3D model preview via Three.js.
- STL export for 3D printing (with on-demand filename generation).
- Modern React/TypeScript codebase, Docker Compose v2, comprehensive tests.
- Backend includes a health check endpoint (`/health`).
- All low-priority features (extra backends, syntax highlighting, advanced exports, production optimizations) tracked in TODO.md.
- No legacy Docker (`docker-compose`) syntax!

## How to Use
- Start with Google Gemini backend only.
- Run lint and test scripts pre-commit and pre-PR.
- Use build commands only provided above.
- All low-priority features are not required for MVP and should update TODO.md.

## Contact/Contribution
- Open issues via GitHub for questions or feature requests.
- Fork, branch, PR with `[<project>] <Title>` in commit titles.
- Always run `pnpm test` and `pnpm lint` before committing.
- All test failures or TypeScript errors must be fixed before PR is accepted.

## See Also
- [README.md](README.md) for human contributors
- [TODO.md](TODO.md) for future/lower-priority agent tasks
