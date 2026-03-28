# UniRoast — Architecture Document

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph Client
        Browser["Browser / PWA\n(React + Vite)"]
    end

    subgraph Backend ["Backend (FastAPI)"]
        API["REST API\n/auth /posts /themes /upload"]
        Auth["JWT Auth\n(python-jose + bcrypt)"]
        AIService["AI Service\n(DeepSeek API)"]
        DB["Database Layer\n(SQLAlchemy ORM)"]
    end

    subgraph External
        Cloudinary["Cloudinary\n(Image Storage)"]
        DeepSeek["DeepSeek API\n(AI Roast Generation)"]
        PostgreSQL["PostgreSQL\n(Production DB)"]
        SQLite["SQLite\n(Test DB)"]
    end

    Browser -- "HTTPS REST + JWT" --> API
    API --> Auth
    API --> DB
    API --> AIService
    API -- "Upload image" --> Cloudinary
    AIService -- "Generate roast" --> DeepSeek
    DB -- "Production" --> PostgreSQL
    DB -- "Testing" --> SQLite
    Cloudinary -- "Image URL" --> DB
```

## 2. Component Breakdown

### 2.1 Frontend (React + Vite)
| Component | Responsibility |
|-----------|---------------|
| `App.jsx` | Route definitions, private route wrapper |
| `store/useAuth.js` | Zustand store — JWT token + user state, persisted to localStorage |
| `api.js` | Axios instance — auto-injects `Authorization: Bearer <token>` |
| `pages/` | Route-level components (Home, Login, ThemePage, PostDetail, Leaderboard, Profile) |
| `components/Navbar.jsx` | Navigation header with auth state |

### 2.2 Backend (FastAPI)
| Module | Responsibility |
|--------|---------------|
| `routers/auth.py` | Register, login, get current user |
| `routers/posts.py` | CRUD for posts, voting, tier calculation |
| `routers/themes.py` | Theme management, today's theme filter |
| `routers/upload.py` | Image validation + Cloudinary upload |
| `ai_service.py` | DeepSeek API call, fallback on failure |
| `auth.py` | JWT creation/verification, bcrypt hashing |
| `models.py` | SQLAlchemy ORM models |
| `schemas.py` | Pydantic request/response schemas |
| `database.py` | DB engine, session factory, dependency injection |

### 2.3 Database Schema

```mermaid
erDiagram
    User {
        int id PK
        string username UK
        string email UK
        string hashed_password
        string avatar_url
        bool is_active
    }
    Theme {
        int id PK
        string title
        string description
        string emoji
        bool is_official
        date active_date
    }
    Post {
        int id PK
        int user_id FK
        int theme_id FK
        string image_url
        string caption
        string ai_comment
        float avg_score
        int vote_count
        datetime created_at
    }
    Vote {
        int id PK
        int user_id FK
        int post_id FK
        int score
    }

    User ||--o{ Post : "submits"
    User ||--o{ Vote : "casts"
    Theme ||--o{ Post : "contains"
    Post ||--o{ Vote : "receives"
```

## 3. Technology Choices & Rationale

| Technology | Alternative Considered | Reason for Choice |
|------------|----------------------|-------------------|
| **FastAPI** | Flask, Django | Async support, automatic OpenAPI docs, Pydantic validation built-in |
| **React + Vite** | Next.js, Vue | Faster dev server than CRA, team familiarity with React |
| **PostgreSQL** | MySQL, MongoDB | Strong relational integrity for votes/posts; SQLite for tests keeps CI simple |
| **SQLAlchemy + Alembic** | Raw SQL, Tortoise ORM | Industry-standard ORM with migration support |
| **Zustand** | Redux, Context API | Minimal boilerplate for simple auth state |
| **TanStack Query** | SWR, manual fetch | Caching, background refetch, loading/error states out of the box |
| **Cloudinary** | S3, local storage | Free tier sufficient; no infrastructure to manage |
| **DeepSeek API** | OpenAI GPT-4 | Cost-effective; OpenAI-compatible SDK; better Chinese language output |
| **JWT (stateless)** | Session cookies | Stateless auth fits a REST API; easier to scale horizontally |

## 4. Data Flow: Post Submission

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as Frontend
    participant BE as Backend
    participant CL as Cloudinary
    participant AI as DeepSeek API
    participant DB as Database

    U->>FE: Select image + write caption
    FE->>BE: POST /upload (multipart, JWT)
    BE->>BE: Validate type & size
    BE->>CL: Upload image
    CL-->>BE: image_url
    BE-->>FE: { image_url }
    FE->>BE: POST /posts { image_url, caption, theme_id }
    BE->>AI: Generate roast (theme + caption)
    AI-->>BE: roast_text (or fallback)
    BE->>DB: INSERT post
    DB-->>BE: post record
    BE-->>FE: PostResponse (with ai_comment, tier)
    FE-->>U: Display post with roast
```

## 5. CI/CD Pipeline

```
Push / PR
    │
    ├── Backend job
    │     ├── pip install (cached)
    │     ├── pytest --cov (SQLite test DB)
    │     └── Coverage report (XML + terminal)
    │
    └── Frontend job
          ├── npm ci (cached)
          ├── vitest --coverage
          └── vite build
```

All jobs must pass before a PR can be merged to `develop` or `main`.
