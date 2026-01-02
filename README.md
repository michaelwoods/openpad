# OpenPAD (Open Prompt Aided Design)

**OpenPAD (Open Prompt Aided Design)** is a modern web application that leverages Google's Gemini AI to generate OpenSCAD 3D model code from natural language prompts. It features an instant 3D preview, STL export for printing, and a fully containerized development environment.

## ✨ Features

-   **AI-Powered Code Generation:** Describe your 3D model in plain English and watch the OpenSCAD code get generated in real-time, with the option to select between Gemini 2.5 Flash/Pro and Gemini 3 Flash/Pro Preview models.
-   **Instant 3D Preview:** A live, interactive 3D viewer powered by Three.js renders your model as you make changes.
-   **STL Export:** Download your generated models as `.stl` files with automatically generated, descriptive filenames, ready for any 3D printer or slicer software.
-   **Modern Tech Stack:** Built with React, TypeScript, Node.js (Fastify), and Vite for a fast and reliable developer experience.
-   **Dockerized:** Get up and running in seconds with a single `docker compose` command, including a backend health check.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v22+)
-   [pnpm](https://pnpm.io/installation)
-   [Docker](https://docs.docker.com/get-docker/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/openpad.git
    cd openpad
    ```

2.  **Set up environment variables:**
    Copy the `.env.example` file to `.env` and add your Google Gemini API key.
    ```bash
    cp .env.example .env
    ```
    ```ini
    # .env
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
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

-   `pnpm dev`: Starts the frontend and backend development servers.
-   `pnpm test`: Runs the test suite for both packages.
-   `pnpm lint`: Lints and formats the entire codebase.
-   `pnpm build`: Builds the frontend and backend for production.

## 🐳 Docker Commands

-   **Development:** `docker compose --profile dev up`
-   **Production:** `docker compose --profile production up`
-   **Build:** `docker compose build`
-   **Logs:** `docker compose logs -f`
-   **Stop:** `docker compose down`
