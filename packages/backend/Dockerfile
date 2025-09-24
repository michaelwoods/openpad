# Backend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install OpenSCAD
RUN apk add --no-cache openscad

# Copy all package manifests and the lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies for the entire workspace
RUN NODE_ENV=development pnpm install --filter backend

# Copy the backend source code
COPY packages/backend/ ./packages/backend/

# Set the final working directory
WORKDIR /app/packages/backend

CMD ["pnpm", "run", "dev"]
