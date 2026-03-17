# MU Innovation Hub

**AI-powered university incubation platform** that helps students go from idea → validation → MVP → growth by combining:
- AI idea evaluation (LLM + offline fallback)
- 24/7 AI startup mentor chatbot (with idea context)
- Smart matchmaking (mentors, investors, industry partners)
- Progress dashboard (stages, milestones, KPIs)
- Mentor session booking + investor connection requests

Built with **Next.js (TypeScript)** + **FastAPI (Python)** + **PostgreSQL**.

## ✨ Features

- **AI Idea Evaluation**: submit an idea and get scoring across market potential, technical feasibility, innovation, and team capability.
- **AI Mentor Chatbot**: 24/7 guidance on business models, MVP planning, pitch preparation, and market validation.
- **Smart Matchmaking**: AI-powered recommendations for mentors, investors, and partners based on your startup domain and content.
- **Mentor Marketplace**: browse mentors and **book mentorship sessions** tied to a specific idea.
- **Investor Portal**: browse investors and **send connection requests** tied to a specific idea.
- **Progress Dashboard**: track stages (ideation → scale), milestones, completion, and KPI data.

## 🧱 Architecture (high level)

```mermaid
graph TB
  FE["Next.js Dashboard"] -->|"HTTP/JSON + JWT"| API["FastAPI REST API"]
  API --> DB[("PostgreSQL")]
  API --> AI["AI Services"]
  AI --> LLM["LLM Provider (OpenAI or Gemini)"]
  AI --> FALLBACK["Rule-based fallback"]
```

## 📁 Repo structure

```
AI_ENABLED_INCUBATION/
├── backend/                 # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── ai/              # chatbot, idea evaluator, recommenders
│   │   ├── routers/         # /api/* endpoints
│   │   ├── models/          # ORM models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # business logic
│   └── Dockerfile
├── frontend/                # Next.js app router
│   ├── src/app/dashboard/   # dashboard pages (ideas, chatbot, networking, progress, etc.)
│   ├── src/components/      # UI components
│   └── src/lib/api.ts       # API client (JWT in localStorage)
└── docker-compose.yml
```

## 🚀 Quick start (recommended: Docker)

### 1) Start everything

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend docs**: `http://localhost:8000/api/docs`

### 2) First run (end-to-end)

1. Open `http://localhost:3000/register` and create a user.
2. Log in at `http://localhost:3000/login`.
3. Submit & instantly evaluate an idea:
   - Go to `Dashboard → Submit Idea` (`/dashboard/submit-idea`)
4. Explore AI mentoring:
   - `Dashboard → AI Mentor Chatbot` (`/dashboard/chatbot`)
   - Select an idea context for targeted advice
5. Smart Matchmaking:
   - `Dashboard → Networking` (`/dashboard/networking`)
   - Select an idea → **Find Matches** (mentors/investors/partners)
6. Book mentorship:
   - `Dashboard → Mentors` (`/dashboard/mentors`) → **Book Session**
7. Connect with investors:
   - `Dashboard → Investors` (`/dashboard/investors`) → **Connect**
8. Track execution:
   - `Dashboard → Progress Dashboard` (`/dashboard/progress`)
   - Add milestones, mark complete, and save KPI data

## 🧑‍💻 Local development (without Docker)

### Prerequisites
- **Python 3.11 or 3.12** (recommended)
  - This repo uses scientific Python packages (`numpy`, `scikit-learn`) that may not ship Windows wheels immediately for brand-new Python releases.
- Node.js 20+
- PostgreSQL 16+ (or use the DB in `docker-compose.yml`)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # Windows copy; edit values
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment variables

Backend reads `.env` via `pydantic-settings` (`backend/app/config.py`).

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DEBUG` | `True/False` (when `False`, `SECRET_KEY` must be ≥32 chars) |
| `PORT` | Server port (Render injects automatically) |
| `SECRET_KEY` | JWT signing secret |
| `LLM_PROVIDER` | `openai` or `google` |
| `OPENAI_API_KEY` | optional |
| `GOOGLE_API_KEY` | optional |
| `FRONTEND_URL` | CORS allow-origin (your Vercel URL in production) |

Frontend:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | defaults to `http://localhost:8000/api` |

---

## 🌐 Production Deployment

### Frontend → Vercel

1. Push the repo to **GitHub**.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Set the **Root Directory** to `frontend`.
4. Add this environment variable in the Vercel dashboard:
    ```
    NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
    ```
5. Click **Deploy**. Vercel auto-detects Next.js.

### Backend → Render

#### Option A: Blueprint (recommended)

1. Push the repo to **GitHub**.
2. Go to [render.com](https://render.com) → **New** → **Blueprint** → select your repo.
3. Render reads `render.yaml` and auto-creates:
   - A **Web Service** (`mu-innovation-hub-api`)
   - A **PostgreSQL** database (`mu-innovation-hub-db`)
4. Set these env vars manually in the Render dashboard:
   - `FRONTEND_URL` → your Vercel URL (e.g. `https://your-app.vercel.app`)
   - `OPENAI_API_KEY` or `GOOGLE_API_KEY` → your LLM key
5. `SECRET_KEY` and `DATABASE_URL` are auto-generated by the blueprint.

#### Option B: Manual setup

1. Go to Render → **New** → **Web Service** → connect your repo.
2. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120`
3. Create a **PostgreSQL** database on Render.
4. Add environment variables:
   ```
   DATABASE_URL       = <Internal Database URL from Render>
   SECRET_KEY         = <random 32+ char string>
   DEBUG              = False
   FRONTEND_URL       = https://your-app.vercel.app
   LLM_PROVIDER       = openai
   OPENAI_API_KEY     = sk-...
   ```

---

## 🔌 Key routes

### Frontend pages
- `/dashboard/submit-idea` — AI idea evaluation (submit + auto-evaluate)
- `/dashboard/ideas` — list ideas and evaluation status
- `/dashboard/chatbot` — AI mentor chatbot (full page)
- `/dashboard/networking` — smart matchmaking (mentors/investors/partners)
- `/dashboard/mentors` — mentor marketplace + book session
- `/dashboard/investors` — investor portal + connect request
- `/dashboard/progress` — stages + milestones + KPIs

### Backend endpoints (selected)
- `POST /api/auth/register` / `POST /api/auth/login`
- `POST /api/ideas/` / `POST /api/ideas/{id}/evaluate`
- `POST /api/chatbot/chat`
- `POST /api/networking/recommend/{mentors|investors|partners}/{idea_id}`
- `POST /api/networking/match`
- `POST /api/mentors/sessions` / `GET /api/mentors/sessions/{idea_id}`
- `POST /api/dashboard/milestones` / `PUT /api/dashboard/milestones/{id}/complete` / `PATCH /api/dashboard/milestones/{id}`

## 🛡️ Notes on AI behavior
- If no LLM API keys are provided, the chatbot and evaluator use **offline fallback logic**.
- LLM calls include basic **timeouts/retries** and structured JSON parsing.

## 📄 License

MIT — Mekelle University Innovation Hub © 2026
