# 🔥 UniRoast - University Hall of Fame

> AI-powered campus social platform where students compete in daily themed challenges

## 📋 Team Information

**Team Name:** [Group 13]

**Section:** [EX1]

**Team Members:**
- [贺柏诚] - [1230003810] - [jekyll-HBC] - Role: [前端/后端/全栈]
- [范云杰] - [学号] - [GitHub用户名] - Role: [前端/后端/全栈]
- [祝天皓] - [1230002239] - [kirei886] - Role: [前端/后端/全栈]
- [魏嘉琦] - [学号] - [GitHub用户名] - Role: [前端/后端/全栈]

**Project Repository:** https://github.com/BSAI301/course-project-ex1-team-13 

---

## 🎯 Project Overview

UniRoast is a gamified social platform designed specifically for university students. Each day features a themed challenge where students upload photos to compete for rankings. An AI system provides humorous roasts, and the community votes to determine daily winners.

### Key Features
- **Daily Themed Challenges**: Fresh topics every day (e.g., "Worst Cafeteria Meal", "Messiest Dorm Room")
- **AI-Powered Roasts**: GPT-4 generates witty, personalized comments on submissions
- **Real-time Battle Rankings**: Live leaderboard with voting system
- **Hall of Fame**: Showcase top performers and legendary moments
- **Social Interaction**: Like, comment, and share campus moments

### Target Users
- University students aged 18-25
- Looking for fun, lighthearted social interaction
- Interested in campus community building

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS + Zustand |
| Backend | FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL (prod) / SQLite (test) |
| AI | DeepSeek API (OpenAI-compatible) |
| Storage | Cloudinary |
| CI/CD | GitHub Actions |

---

## 🚀 Quick Start

### Backend
```bash
cd Backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, SECRET_KEY, OPENAI_API_KEY, CLOUDINARY_*
uvicorn main:app --reload
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Run Tests
```bash
# Backend (with coverage)
cd Backend
pytest

# Frontend (with coverage)
cd Frontend
npm run test:coverage
```

---

## 🌿 Git Workflow

### Branch Strategy
| Branch | Purpose |
|--------|---------|
| `main` | Production — merged from `develop` via PR only |
| `develop` | Integration — all feature branches merge here |
| `feature/<module>-<desc>` | New features, e.g. `feature/auth-jwt-login` |
| `fix/<desc>` | Bug fixes, e.g. `fix/upload-size-validation` |
| `docs/<topic>` | Documentation updates |
| `test/<scope>` | Test additions |

### Development Flow
1. Open a GitHub Issue describing the task, assign to a Milestone
2. Create a branch from `develop`: `git checkout -b feature/your-feature`
3. Write code + tests together
4. Push and open a PR — include `Closes #<issue>` in the description
5. CI must pass before merging
6. Merge to `develop`, close the issue

### Commit Message Format
```
<type>(<scope>): <short description>

Types: feat | fix | docs | test | refactor | chore | ci
```

---

## 📁 Project Structure

```
Uniroast/
├── Backend/          # FastAPI application
│   ├── routers/      # API route handlers
│   ├── tests/        # pytest integration & unit tests
│   ├── models.py     # SQLAlchemy ORM models
│   ├── schemas.py    # Pydantic schemas
│   └── ai_service.py # DeepSeek AI roast generation
├── Frontend/         # React + Vite application
│   └── src/
│       ├── pages/    # Route-level components
│       ├── store/    # Zustand auth store
│       └── api.js    # Axios instance
├── Docs/
│   ├── requirements.md   # Functional & non-functional requirements
│   └── architecture.md   # System architecture & tech decisions
└── .github/workflows/ci.yml  # CI pipeline
```

---

## 📄 External References

- AI roast generation powered by [DeepSeek API](https://platform.deepseek.com/)
- Image hosting via [Cloudinary](https://cloudinary.com/)
- UI icons from [Lucide React](https://lucide.dev/)
