# OpenPAD API Documentation

OpenPAD provides a REST API for generating OpenSCAD 3D models from natural language prompts.

## Base URL

```
http://localhost:3000
```

## Interactive Documentation

Swagger UI is available at `/docs` for interactive API exploration.

## Endpoints

---

### POST /api/generate

Generate OpenSCAD code from a natural language prompt and render it to STL.

**Request Body**

| Field        | Type   | Required | Description                                                                                  |
| ------------ | ------ | -------- | -------------------------------------------------------------------------------------------- |
| `prompt`     | string | Yes      | Natural language description of the desired 3D model                                         |
| `provider`   | string | No       | AI provider to use: `gemini`, `ollama`, `openai`, `openrouter`, `custom` (default: `gemini`) |
| `model`      | string | No       | Specific model ID to use (provider-specific)                                                 |
| `style`      | string | No       | Code style: `Default` or `Modular`                                                           |
| `attachment` | string | No       | Additional file content to include in prompt                                                 |

**Example Request**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A 20mm cube with a 5mm hole through the center",
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "style": "Default"
  }'
```

**Success Response (200)**

```json
{
  "code": "cube(20);\ntranslate([0, 0, 10]) cylinder(h=25, r=2.5, center=true);",
  "stl": "c29RdmVyc2lvbi...",
  "generationInfo": {
    "finishReason": "stop"
  }
}
```

**Error Response (400)** - Invalid request body

```json
{
  "error": "Invalid request body",
  "details": [
    {
      "code": "invalid_type",
      "path": ["prompt"],
      "message": "Required"
    }
  ]
}
```

**Error Response (422)** - OpenSCAD compilation failed

```json
{
  "error": "OpenSCAD failed to compile the generated code.",
  "code": "invalid_openscad_code_here",
  "stl": null,
  "details": "ERROR: Parser error at line 1"
}
```

**Error Response (500)** - Internal server error

```json
{
  "error": "An internal server error occurred."
}
```

---

### POST /api/render

Render existing OpenSCAD code to various 3D formats.

**Request Body**

| Field    | Type   | Required | Description                                         |
| -------- | ------ | -------- | --------------------------------------------------- |
| `code`   | string | Yes      | OpenSCAD code to render                             |
| `format` | string | No       | Output format: `stl`, `amf`, `3mf` (default: `stl`) |

**Example Request**

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "code": "cube(20);",
    "format": "stl"
  }'
```

**Success Response (200)**

```json
{
  "stl": "c29RdmVyc2lvbi..."
}
```

**Error Response (400)** - Invalid request body

```json
{
  "error": "Invalid request body",
  "details": [...]
}
```

**Error Response (422)** - OpenSCAD compilation failed

```json
{
  "error": "OpenSCAD failed to compile the provided code.",
  "details": "ERROR: Parser error at line 1"
}
```

---

### POST /api/filename

Generate a descriptive, file-safe filename for an STL model based on the user's prompt.

**Request Body**

| Field    | Type   | Required | Description                             |
| -------- | ------ | -------- | --------------------------------------- |
| `prompt` | string | Yes      | The original user prompt (1-1000 chars) |

**Example Request**

```bash
curl -X POST http://localhost:3000/api/filename \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A 20mm cube with a 5mm hole through the center"
  }'
```

**Success Response (200)**

```json
{
  "filename": "20mm_cube_with_hole.stl"
}
```

**Error Response (400)** - Invalid request body

```json
{
  "error": "Invalid request body",
  "details": [...]
}
```

**Error Response (500)** - Internal server error

```json
{
  "error": "Failed to generate filename from AI model"
}
```

---

### GET /api/models

Get list of available AI models from all configured providers.

**Query Parameters**

None required.

**Example Request**

```bash
curl http://localhost:3000/api/models
```

**Success Response (200)**

```json
{
  "providers": [
    {
      "id": "gemini",
      "name": "Google Gemini",
      "models": ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"],
      "configured": true
    },
    {
      "id": "openai",
      "name": "OpenAI",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "configured": true,
      "baseUrl": "https://api.openai.com/v1"
    },
    {
      "id": "ollama",
      "name": "Ollama (Local)",
      "models": ["llama3", "codellama"],
      "configured": true,
      "baseUrl": "http://127.0.0.1:11434"
    }
  ]
}
```

---

### GET /health

Health check endpoint.

**Example Request**

```bash
curl http://localhost:3000/health
```

**Success Response (200)**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Environment Variables

| Variable                   | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `GEMINI_API_KEY`           | Google Gemini API key                               |
| `OPENAI_API_KEY`           | OpenAI API key                                      |
| `OPENAI_BASE_URL`          | Custom OpenAI-compatible base URL                   |
| `OLLAMA_HOST`              | Ollama host URL (default: `http://127.0.0.1:11434`) |
| `OLLAMA_API_KEY`           | Ollama API key (optional)                           |
| `OPENROUTER_API_KEY`       | OpenRouter API key                                  |
| `OPENROUTER_REFERER`       | HTTP referer for OpenRouter                         |
| `OPENROUTER_TITLE`         | Title for OpenRouter                                |
| `CUSTOM_PROVIDER_ENABLED`  | Enable custom provider (`true`/`false`)             |
| `CUSTOM_PROVIDER_BASE_URL` | Custom provider base URL                            |
| `CUSTOM_PROVIDER_API_KEY`  | Custom provider API key                             |
| `CUSTOM_PROVIDER_NAME`     | Custom provider display name                        |

## Error Codes

| Code | Description                                        |
| ---- | -------------------------------------------------- |
| 400  | Bad Request - Invalid request body or parameters   |
| 422  | Unprocessable Entity - OpenSCAD compilation failed |
| 500  | Internal Server Error                              |
