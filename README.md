# DocBrain

**AI-powered document analysis. Upload once, understand everything.**

DocBrain extracts meaning from any document — summaries, entities, questions, sentiment, concept maps, and a full chat interface — all powered by Google Gemini.

---

## Features

| Feature | Description |
|---------|-------------|
| Smart Summaries | 4 styles: Executive Brief, Bullet Points, ELI5, Academic |
| Entity Extraction | People, Organizations, Locations, Dates, Key Terms, Statistics |
| Study Questions | 3 difficulty levels — Factual, Analytical, Critical Thinking |
| Sentiment Analysis | Overall tone + emotional breakdown radar chart |
| Concept Map | Interactive knowledge graph with zoom, pan, drag |
| Document Chat | Ask follow-up questions with real-time streaming responses |

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express
- **AI:** Google Gemini 2.5 Flash (via `@google/generative-ai`)
- **Charts:** Recharts
- **Graph:** React Flow + dagre

## Prerequisites

- Node.js 18 or higher
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)

## Quick Start

```bash
# Clone
git clone <your-repo-url>
cd docbrain

# Install dependencies (installs both client and server)
npm install

# Configure API key
cp server/.env.example server/.env
# Edit server/.env and set your GEMINI_API_KEY

# Start dev servers
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

`server/.env`:

```env
GEMINI_API_KEY=your_key_here
PORT=3001
NODE_ENV=development
```

## Project Structure

```
docbrain/
├── client/               # React + Vite frontend
│   └── src/
│       ├── api/          # API client + endpoint functions
│       ├── components/   # Analysis panels, upload, chat UI
│       ├── contexts/     # DocumentContext (global state)
│       ├── hooks/        # useAnalysis, useChat, useDocument
│       └── utils/        # Formatters, localStorage history
└── server/               # Express backend
    └── src/
        ├── routes/       # /api/upload, /api/analyze, /api/chat
        ├── services/     # Gemini integration, parser, prompts
        └── middleware/   # Rate limiting, validation, error handling
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload PDF/DOCX/TXT or paste text |
| `POST` | `/api/analyze` | Run analysis (summary/entities/questions/sentiment/conceptMap) |
| `POST` | `/api/chat` | Stream chat response (SSE) |
| `GET` | `/api/health` | Health check |

## Production Build

```bash
npm run build    # Builds frontend into server/public/
npm start        # Serves everything from Express on PORT
```

## Notes

- Supported file types: PDF, DOCX, TXT (max 10 MB)
- Document history: last 20 documents saved in localStorage
- Rate limits: 20 analysis requests/min, 30 chat requests/min
- Gemini model fallback chain: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash-lite`
