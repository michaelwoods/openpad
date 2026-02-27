# OpenPAD (Open Prompt Aided Design)

**OpenPAD (Open Prompt Aided Design)** is a modern web application that leverages Google's Gemini AI to generate OpenSCAD 3D model code from natural language prompts. It features an instant 3D preview, STL export for printing, and a fully containerized development environment.

## ✨ Features

- **AI-Powered Code Generation:** Describe your 3D model in plain English and watch the OpenSCAD code get generated in real-time, with support for multiple AI backends:
  - **Google Gemini** (Cloud) - Default provider
  - **OpenAI** - GPT-4o, GPT-4o-mini, and compatible APIs
  - **Ollama** - Local inference with models like Llama 3.1, CodeLlama
  - **OpenRouter** - Access 100+ models from various providers
  - **Custom Provider** - Connect to any OpenAI-compatible API
- **Instant 3D Preview:** A live, interactive 3D viewer powered by Three.js renders your model as you make changes.
- **STL Export:** Download your generated models as `.stl` files with automatically generated, descriptive filenames, ready for any 3D printer or slicer software.
- **Modern Tech Stack:** Built with React, TypeScript, Node.js (Fastify), and Vite for a fast and reliable developer experience.
- **Dockerized:** Get up and running in seconds with a single `docker compose` command, including a backend health check.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20+)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/get-docker/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/openpad.git
    cd openpad
    ```

2.  **Set up environment variables:**
    Copy the `.env.example` file to `.env` and configure your preferred AI provider(s).

    ```bash
    cp .env.example .env
    ```

    ```ini
    # .env - Choose your provider(s)

    # Google Gemini (Default)
    GEMINI_API_KEY="YOUR_API_KEY_HERE"

    # OpenAI
    # OPENAI_API_KEY="YOUR_API_KEY_HERE"
    # OPENAI_BASE_URL="https://api.openai.com/v1"

    # Ollama (Local)
    # OLLAMA_HOST="http://127.0.0.1:11434"

    # OpenRouter
    # OPENROUTER_API_KEY="YOUR_API_KEY_HERE"

    # Custom Provider (any OpenAI-compatible API)
    # CUSTOM_PROVIDER_ENABLED="true"
    # CUSTOM_PROVIDER_NAME="My Provider"
    # CUSTOM_PROVIDER_BASE_URL="https://api.example.com/v1"
    # CUSTOM_PROVIDER_API_KEY="YOUR_API_KEY_HERE"
    ```

    ```ini
    # .env
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    OLLAMA_HOST="http://127.0.0.1:11434" # Optional, for local Ollama support
    ```

3.  **Install dependencies:**

    ```bash
    pnpm install
    ```

4.  **Launch the development environment:**
    This command starts both the frontend and backend services in development mode with hot-reloading.
    ```bash
    docker compose --profile dev up --build
    ```

The application will be available at `http://localhost:5173`.

## 🛠️ Available Scripts

- `pnpm dev`: Starts the frontend and backend development servers.
- `pnpm test`: Runs the test suite for both packages.
- `pnpm lint`: Lints and formats the entire codebase.
- `pnpm build`: Builds the frontend and backend for production.

## 🐳 Docker Commands

- **Development:** `docker compose --profile dev up`
- **Production:** `docker compose --profile production up`
- **Build:** `docker compose build`
- **Logs:** `docker compose logs -f`
- **Stop:** `docker compose down`
