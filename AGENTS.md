# AGENTS.md

## Current Status: MVP Complete

## General Directives

- **Documentation Maintenance:** After any change to the codebase, features, or project status, you MUST review and update the README.md and TODO.md files to reflect these changes accurately.
- **Keep Documentation in Sync:** When updating AGENTS.md, review [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) and ensure cross-references are accurate. Avoid duplicating content; reference AGENTS.md from CONTRIBUTING.md for technical details.

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

- Natural language prompt to OpenSCAD code generation via Google Gemini (with configurable models: Gemini 2.5 Flash/Pro, Gemini 3 Flash/Pro Preview).
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

- See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for human contributor guidelines.
- Open issues via GitHub for questions or feature requests.
- Fork, branch, PR with `[<project>] <Title>` in commit titles.
- Always run `pnpm test` and `pnpm lint` before committing.
- All test failures or TypeScript errors must be fixed before PR is accepted.

## See Also

- [README.md](README.md) for human contributors
- [TODO.md](TODO.md) for future/lower-priority agent tasks

## Testing Lessons Learned

- **`jsdom` Limitations:** The `jsdom` environment used for testing has limitations. It does not implement all browser features, such as `window.matchMedia` and navigation. When encountering strange errors in tests, consider if they might be caused by `jsdom` limitations.
- **Mocking Browser Features:** To work around `jsdom` limitations, you may need to mock browser features. For example, `window.matchMedia` can be mocked to prevent errors in libraries that use it. A polyfill for `ResizeObserver` may also be needed.
- **`@react-three/fiber` Testing:** Testing components that use `@react-three/fiber` is challenging in `jsdom` because it lacks a WebGL implementation and `requestAnimationFrame`. This makes it impossible to render 3D scenes and creates issues with hooks that rely on the `r3f` context. It is recommended to use an e2e testing framework like Playwright or Cypress for these components.
- **`vi.mock` Hoisting:** Be aware that `vi.mock` calls are hoisted to the top of the file. This can lead to `ReferenceError` if you are trying to use a variable defined in the test file to configure the mock. To avoid this, define the mock entirely within the factory function, or use `vi.doMock` for dynamic mocks.
- **Over-mocking:** Be careful not to over-mock. Mocking fundamental functions like `document.createElement` can lead to unexpected errors. It's often better to use the real functions and spy on them instead.
- **Race Conditions:** Asynchronous operations in tests can lead to race conditions. Use `async/await` and `waitFor` to ensure that operations happen in the correct order.
- **Circular Dependencies in Mocks:** Be careful not to create circular dependencies in your mocks. For example, calling `document.createElement` inside a mock for `document.createElement` will cause a stack overflow.
