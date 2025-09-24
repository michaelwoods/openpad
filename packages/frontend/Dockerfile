# Frontend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy all package manifests and the lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

# Install dependencies for the entire workspace
RUN NODE_ENV=development pnpm install --filter frontend

# Copy the frontend source code
COPY packages/frontend/ ./packages/frontend/

# Set the final working directory
WORKDIR /app/packages/frontend

CMD ["pnpm", "run", "dev"]
