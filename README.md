# UniRoast — University Hall of Fame

> AI-powered campus social platform where students compete in daily themed challenges

**Course:** BSAI301 | **Section:** EX1 | **Team:** 13

| Name | Student ID | GitHub | Role |
|------|-----------|--------|------|
| 贺柏诚 | 1230003810 | jekyll-HBC | Full-stack, AI integration, DevOps |
| 祝天皓 | 1230002239 | kirei886 | Frontend, UI components |
| 魏嘉琦 | 1230017330 | holiday739 | Frontend |
| 范云杰 | 1230003103 | — | — |

**Live demo:** https://weroast.pages.dev  
**Backend API:** https://course-project-ex1-team-13-production.up.railway.app  
**Repository:** https://github.com/BSAI301/course-project-ex1-team-13

---

## Project Overview

UniRoast is a gamified social platform for university students. Each day features a themed challenge where students upload photos to compete for rankings. An AI system generates humorous roasts, and the community votes to determine daily winners.

**Core features:**
- Daily themed challenges (e.g., "Worst Cafeteria Meal", "Messiest Dorm Room")
- AI-generated roasts powered by DeepSeek / ByteDance Doubao API
- Binary voting system (Hot / Not) with real-time leaderboard
- Hall of Fame showcasing top performers
- User profiles with streaks, seasons, and follow system
- Image uploads via Cloudinary

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS + Zustand |
| Backend | FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL (production) / SQLite (testing) |
| AI | DeepSeek API (via OpenAI-compatible client) |
| Storage | Cloudinary |
| CI/CD | GitHub Actions → Railway (backend) + Cloudflare Pages (frontend) |

---

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm 10+
- PostgreSQL 15+ (for production; SQLite is used automatically in tests)

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/BSAI301/course-project-ex1-team-13.git
cd course-project-ex1-team-13
```

### 2. Backend setup

```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Backend configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/uniroast
SECRET_KEY=your-secret-key-here          # any long random string
DEEPSEEK_API_KEY=your-deepseek-api-key   # from platform.deepseek.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### 4. Database migration

```bash
# Inside Backend/ with venv activated
alembic upgrade head
```

Optionally seed initial theme data:

```bash
python seed_themes.py
```

### 5. Frontend setup

```bash
cd ../Frontend
npm install
```

### 6. Frontend configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## Running the Application

### Start the backend

```bash
cd Backend
source venv/bin/activate
uvicorn main:app --reload
```

API available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### Start the frontend

```bash
cd Frontend
npm run dev
```

Frontend available at `http://localhost:5173`

---

## Testing

### Backend tests

Tests use SQLite in-memory — no PostgreSQL required.

```bash
cd Backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage report
pytest --cov=. --cov-report=term-missing
```

Current backend coverage: **92%**

### Frontend unit tests

```bash
cd Frontend
npm run test           # run once
npm run test:coverage  # with coverage report
```

### End-to-end tests (Playwright)

Requires both backend and frontend running locally.

```bash
# Terminal 1 — start backend
cd Backend && uvicorn main:app --reload

# Terminal 2 — run E2E tests
cd Frontend
npx playwright install --with-deps chromium   # first time only
npm run test:e2e
```

---

## CI/CD Pipeline

GitHub Actions runs on every push and pull request:

| Job | Trigger | What it does |
|-----|---------|-------------|
| Backend Tests | all branches | pytest with SQLite, coverage |
| Frontend Tests | all branches | vitest + build check |
| E2E Tests | all branches | Playwright against local stack |
| Deploy | push to `main` | Railway (backend) + Cloudflare Pages (frontend) |

---

## Project Structure

```
course-project-ex1-team-13/
├── Backend/
│   ├── routers/          # API route handlers (auth, posts, votes, users, ai)
│   ├── tests/            # pytest integration & unit tests
│   ├── migrations/       # Alembic database migrations
│   ├── main.py           # FastAPI app entry point
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── auth.py           # JWT authentication
│   ├── ai_service.py     # DeepSeek AI roast generation
│   ├── upload_service.py # Cloudinary image upload
│   ├── database.py       # DB session management
│   └── requirements.txt
├── Frontend/
│   └── src/
│       ├── pages/        # Route-level components
│       ├── components/   # Reusable UI components
│       ├── store/        # Zustand auth store
│       └── api.js        # Axios instance with interceptors
├── Docs/
│   ├── requirements.md   # Functional & non-functional requirements
│   └── architecture.md   # System architecture & design decisions
└── .github/
    └── workflows/
        └── ci.yml        # CI/CD pipeline definition
```

---

## Git Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production — merged via PR only |
| `develop` | Integration — all feature branches merge here |
| `feature/<module>-<desc>` | New features |
| `fix/<desc>` | Bug fixes |
| `test/<scope>` | Test additions |

**Commit format:** `<type>(<scope>): <description>`  
Types: `feat` | `fix` | `docs` | `test` | `refactor` | `chore` | `ci`

---

## External Services

- [DeepSeek API](https://platform.deepseek.com/) — AI roast generation
- [Cloudinary](https://cloudinary.com/) — image storage and CDN
- [Railway](https://railway.app/) — backend hosting
- [Cloudflare Pages](https://pages.cloudflare.com/) — frontend hosting
