# EX1-Team-13 Project Progress Report
**BSAI301 – Software Engineering and Project Management**

**Team:** Group 13 | **Section:** EX1  
**Members:** 贺柏诚 (jekyll-HBC), 范云杰, 祝天皓, 魏嘉琦  
**Repository:** https://github.com/BSAI301/course-project-ex1-team-13  
**Date:** 2026-04-08

---

## 1. Project Summary and Requirements

### 1.1 Finalized Project Summary

UniRoast is a gamified campus social platform built for university students aged 18–25. The system enables students to participate in daily themed photo challenges, receive AI-generated humorous commentary on their submissions, and compete for rankings through a community voting system.

**Type of system:** Web-based social platform (React PWA + REST API backend), deployable on mobile and desktop browsers.

**Intended users and stakeholders:** University students seeking lighthearted social interaction within their campus community; course instructors evaluating the engineering process.

**Problem addressed:** Existing social platforms (Instagram, WeChat Moments) lack structured, gamified engagement mechanisms tailored to campus life. UniRoast introduces daily themed constraints and AI-driven commentary to lower the barrier to participation and increase engagement.

**Current development goal:** Deliver a functional MVP covering user authentication, daily themed challenges, photo submission with AI roast generation, binary voting, tier-based ranking, user profiles, and a weekly season system.

---

### 1.2 Core Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Users can register with a unique username, email, and password |
| FR-02 | Users can log in and receive a JWT token (30-minute validity) |
| FR-03 | Protected routes require a valid JWT token |
| FR-05 | Admins can create themed challenges with title, description, and emoji |
| FR-06 | Each theme can be assigned an `active_date` to designate it as today's challenge |
| FR-07 | Users can view the current day's active theme |
| FR-09 | Authenticated users can submit a photo and caption for the active theme |
| FR-10 | Photos are uploaded to Cloudinary; only the URL is stored in the database |
| FR-11 | Accepted formats: JPEG, PNG, WebP, GIF; maximum size: 10 MB |
| FR-12 | Upon submission, the system automatically generates an AI roast comment via DeepSeek API |
| FR-13 | If the AI service is unavailable, a fallback comment is used and the post is still published |
| FR-14 | Authenticated users can cast a binary vote ("heng" or "la") on any post |
| FR-15 | The system calculates and stores the running heng-rate per post |
| FR-16 | Each post is assigned a tier label based on heng-rate: 夯 (≥92%), 顶级 (≥75%), 人上人 (≥50%), NPC (≥25%), 拉完了 (<25%) |
| FR-17 | The leaderboard displays posts sorted by heng-rate (descending) |
| FR-18 | Authenticated users can view and edit their own profile page |

**Note — scope change from proposal:** The original 1–5 star voting system was replaced with a binary "heng/la" (approve/disapprove) mechanism. This change was made to reduce voting friction and produce more decisive tier rankings. The tier labels were recalibrated accordingly.

---

### 1.3 Core Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | API response time for read endpoints must be < 500 ms under normal load |
| NFR-02 | Image upload (excluding Cloudinary transfer) must complete within 2 seconds |
| NFR-03 | Frontend initial load (LCP) must be < 3 seconds on standard broadband |
| NFR-04 | All data-modifying API endpoints require JWT authentication |
| NFR-05 | JWT secrets are stored in environment variables, never hardcoded |
| NFR-06 | File uploads are validated for type and size before being sent to Cloudinary |
| NFR-07 | CORS is restricted to the known frontend origin in production |
| NFR-08 | AI roast generation failure must not block post submission (graceful degradation) |
| NFR-09 | The CI pipeline must pass on every push before a PR can be merged |
| NFR-10 | The application must be usable on mobile screens (≥ 375 px width) |
| NFR-11 | The app is installable as a PWA on iOS and Android |
| NFR-12 | Database schema changes are managed via Alembic migrations |

---

## 2. System Design with UML Models

### 2.1 Context Model — System Boundary Diagram

The diagram below shows UniRoast's boundary and its interactions with external systems.

```
┌─────────────────────────────────────────────────────────────┐
│                        UniRoast System                       │
│                                                             │
│   ┌──────────────┐      ┌──────────────┐                   │
│   │   Frontend   │◄────►│   Backend    │                   │
│   │ React + Vite │      │   FastAPI    │                   │
│   │    (PWA)     │      │              │                   │
│   └──────────────┘      └──────┬───────┘                   │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                       ▼
   ┌─────────────┐      ┌──────────────┐       ┌──────────────┐
   │  PostgreSQL  │      │  Cloudinary  │       │ DeepSeek API │
   │  (Database)  │      │   (Images)   │       │  (AI Roast)  │
   └─────────────┘      └──────────────┘       └──────────────┘

External Actors:
  [University Student] ──► Frontend (browser / PWA)
  [Admin]              ──► Backend API (theme management)
```

### 2.2 Interaction Model — Use Case Diagram

```
                        ┌──────────────────────────────────┐
                        │           UniRoast System         │
                        │                                  │
  ┌──────────┐          │  ○ Register / Login              │
  │          │──────────│  ○ View Today's Theme            │
  │ Student  │          │  ○ Submit Photo + Caption        │
  │  (User)  │──────────│  ○ Receive AI Roast Comment      │
  │          │          │  ○ Vote on Posts (heng / la)     │
  └──────────┘──────────│  ○ View Leaderboard              │
                        │  ○ View & Edit Profile           │
                        │  ○ View Season Rankings          │
  ┌──────────┐          │                                  │
  │  Admin   │──────────│  ○ Create / Manage Themes        │
  └──────────┘          └──────────────────────────────────┘
```

### 2.3 Interaction Model — Sequence Diagram: Post Submission

```
User      Frontend       Backend        Cloudinary     DeepSeek API    Database
 │            │              │               │               │              │
 │─select img─►             │               │               │              │
 │            │──POST /upload►              │               │              │
 │            │              │──upload img──►               │              │
 │            │              │◄──image_url──│               │              │
 │            │◄──{image_url}│               │               │              │
 │            │──POST /posts─►              │               │              │
 │            │              │──generate_roast(theme+caption)►             │
 │            │              │◄──────────────roast_text──────│              │
 │            │              │──────────────────────────────────INSERT post►│
 │            │              │◄─────────────────────────────────post record─│
 │            │◄──PostResponse│              │               │              │
 │◄─display──│               │               │               │              │
```

### 2.4 Structural Model — Class Diagram (Core Entities)

```
┌──────────────────┐         ┌──────────────────┐
│      User        │         │      Theme        │
├──────────────────┤         ├──────────────────┤
│ id: int          │         │ id: int           │
│ username: str    │         │ title: str        │
│ email: str       │         │ emoji: str        │
│ hashed_password  │         │ description: str  │
│ avatar_url: str  │         │ active_date: date │
│ streak: int      │         │ is_official: bool │
│ bio: str         │         └────────┬─────────┘
└────────┬─────────┘                  │ 1
         │ 1                          │
         │ *                          │ *
┌────────▼─────────────────────────────▼──────┐
│                    Post                      │
├──────────────────────────────────────────────┤
│ id: int                                      │
│ user_id: FK → User                           │
│ theme_id: FK → Theme                         │
│ image_url: str                               │
│ caption: str                                 │
│ ai_comment: str                              │
│ heng_count: int                              │
│ vote_count: int                              │
│ avg_score: float  (stores heng_rate 0.0–1.0) │
│ created_at: datetime                         │
└────────────────────┬─────────────────────────┘
                     │ 1
                     │ *
              ┌──────▼──────┐
              │    Vote      │
              ├─────────────┤
              │ id: int      │
              │ user_id: FK  │
              │ post_id: FK  │
              │ vote_type: str│  ("heng" | "la")
              └─────────────┘
```

### 2.5 Behavioral Model — State Machine: Post Lifecycle

```
                    ┌─────────────┐
                    │   [Start]    │
                    └──────┬──────┘
                           │ User submits photo + caption
                           ▼
                    ┌─────────────┐
                    │  Uploading   │  (image → Cloudinary)
                    └──────┬──────┘
                           │ image_url received
                           ▼
                    ┌─────────────┐
                    │ AI Roasting  │  (DeepSeek API call)
                    └──────┬──────┘
                           │ roast generated (or fallback)
                           ▼
                    ┌─────────────┐
                    │  Published   │  tier = "未评级"
                    └──────┬──────┘
                           │ vote_count ≥ 3
                           ▼
                    ┌─────────────┐
                    │  Ranked      │  tier ∈ {夯, 顶级, 人上人, NPC, 拉完了}
                    └──────┬──────┘
                           │ season ends (weekly rollover)
                           ▼
                    ┌─────────────┐
                    │  Archived    │  snapshot saved to SeasonSnapshot
                    └─────────────┘
```

---

## 3. Progress Against Plan

### 3.1 Planned vs. Completed Work

| Planned Feature | Status | Notes |
|----------------|--------|-------|
| User registration & JWT login | Done | FR-01 to FR-04 fully implemented |
| Daily themed challenges | Done | Theme CRUD, active_date filter |
| Photo upload (Cloudinary) | Done | Type + size validation |
| AI roast generation (DeepSeek) | Done | Fallback on API failure |
| 1–5 star voting system | **Replaced** | Redesigned as binary heng/la vote |
| Tier-based ranking | Done | Recalibrated for binary vote |
| Leaderboard page | Done | Sorted by heng-rate |
| User profile page | Done | View + edit (bio, avatar, username) |
| Weekly season system | Done | Auto-rollover via APScheduler |
| Comment system | In Progress | Model defined; API not yet exposed |
| Friends / social graph | Blocked | Placeholder page only |
| PWA installability | Done | Manifest + service worker configured |
| CI pipeline | Done | Backend pytest + Frontend vitest on every push |

### 3.2 Evidence from the Development Process

The following repository artifacts demonstrate progress:

- **Commits (selected):**
  - `feat: implement avatar upload in ProfileInfo` — profile editing complete
  - `feat(backend): 新增用户 bio/private_email/phone 字段及 PATCH /auth/me 接口 #84`
  - `feat(frontend): 首页重构为 WeRoast 风格单页布局 #84`
  - `feat: UI重设计Phase1 + 二元投票 + 推荐Feed (develop→main)` — major milestone merge
  - `fix(migrations): 修复 Alembic 双头问题` — migration integrity maintained

- **Migrations (Alembic):** Five migration versions exist, tracking schema evolution from initial schema through binary vote redesign and season system addition.

- **CI pipeline:** `.github/workflows/ci.yml` runs backend pytest and frontend vitest on every push to every branch. Both jobs must pass before merging.

- **Branch strategy:** Feature branches (`feature/*`, `fix/*`) merge to `develop` via PR; `develop` merges to `main` for releases. The `kirei` branch is the active development branch.

- **Issue #84:** Tracks the UI redesign and profile feature set, with multiple commits referencing it.

---

## 4. Current Feature Status and Scope Update

### 4.1 Current Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| User registration & login | Done | JWT auth, bcrypt passwords |
| JWT-protected routes | Done | All write endpoints secured |
| Theme management (CRUD) | Done | Admin can create/list themes |
| Today's theme display | Done | Filtered by `active_date` |
| Photo upload to Cloudinary | Done | Validation: type + 10 MB limit |
| AI roast generation | Done | DeepSeek API + fallback |
| Binary voting (heng / la) | Done | Replaces original 1–5 star system |
| Tier calculation | Done | 5-tier system based on heng-rate |
| Leaderboard | Done | Sorted by heng-rate |
| User profile (view + edit) | Done | Bio, avatar, username, password |
| Weekly season system | Done | Auto-rollover, SeasonSnapshot |
| Recommend feed | Done | Frontend page implemented |
| Comment system (API) | In Progress | DB model exists; router not yet wired |
| Friends / social graph | Blocked | Placeholder page; no backend |
| VIP / premium features | Blocked | Placeholder page only |
| PWA manifest | Done | Installable on iOS/Android |
| CI/CD pipeline | Done | GitHub Actions, all branches |

### 4.2 Updated Schedule and Revised Scope

**Scope changes from proposal:**

1. **Binary voting replaces 1–5 stars** — The original star rating system was replaced with a binary heng/la mechanism. Reason: binary voting reduces decision fatigue, increases voting throughput, and produces clearer tier separation. Impact: tier thresholds were recalibrated to heng-rate percentages.

2. **Season system added** — A weekly season rollover system (not in the original proposal) was added to provide recurring engagement. Impact: added `Season` and `SeasonSnapshot` models and an APScheduler background job.

3. **Comment system deferred** — The comment system model is defined but the API is not yet exposed. This is deferred to the next milestone.

**Updated schedule (remaining semester):**

| Milestone | Target | Key Deliverables |
|-----------|--------|-----------------|
| M2 — Progress Report | Week 8 (current) | This report |
| M3 — Feature Completion | Week 11 | Comment API, integration test coverage, leaderboard polish |
| M4 — Demo Preparation | Week 13 | End-to-end demo flow, deployment stable on Railway/Vercel |
| M5 — Final Report | Week 15 | Full documentation, test coverage report, retrospective |

---

## 5. Testing and CI Status

### 5.1 CI/CD Pipeline

The CI pipeline is defined in `.github/workflows/ci.yml` and runs on every push and pull request to any branch. It consists of two parallel jobs:

- **Backend job:** Installs Python 3.11 dependencies, runs `pytest --tb=short -q` against a SQLite test database (no external services required), and generates a coverage report.
- **Frontend job:** Installs Node 20 dependencies via `npm ci`, runs `vitest --coverage`, and executes `vite build` to verify the production build succeeds.

Both jobs must pass before a PR can be merged to `develop` or `main`.

### 5.2 Testing Strategy

The project uses a two-layer testing approach:

- **Backend — Integration tests** (`Backend/tests/test_api.py`): Tests exercise the full HTTP request/response cycle using FastAPI's `TestClient` against a real SQLite database. External services (DeepSeek AI, Cloudinary) are mocked using `unittest.mock.AsyncMock` and `patch` to ensure tests are deterministic and fast.

- **Frontend — Unit tests** (`Frontend/src/__tests__/tier.test.js`): Tests cover the tier calculation utility (`utils/tier.js`) using Vitest.

### 5.3 Tests Implemented

**Backend integration tests cover:**
- User registration (success, duplicate rejection)
- Login (success, wrong password)
- Authenticated `/auth/me` endpoint
- Theme CRUD (create, get, not-found)
- Post creation with mocked AI roast
- Post creation with invalid theme (404)
- Post listing
- Binary voting (heng vote, invalid vote type)
- `ratio_to_tier` unit test (all tier boundaries)
- Full end-to-end journey: register → login → create theme → submit post → vote → leaderboard

**Frontend unit tests cover:**
- Tier label calculation from heng-rate values

### 5.4 Current Limitations and Improvement Plan

- Backend test coverage reporting is configured but a coverage badge has not yet been added to the README.
- The comment system and friends features are not yet tested (no API implemented).
- Frontend test coverage is limited to utility functions; component-level tests are planned for Milestone 3.

---

## 6. Risks, Issues, and Actions Taken

### Issue 1: Alembic Migration Conflict (Double-Head)

**What happened:** After merging two feature branches that each added a migration, Alembic detected two "head" revisions, breaking the migration chain.

**Why it mattered:** A broken migration chain prevents `alembic upgrade head` from running, which would block deployment and onboarding of new developers.

**Action taken:** Commit `877ad82` (`fix(migrations): 修复 Alembic 双头问题`) manually edited the `b2c3d4e5f6a7` migration to depend on `fbab889f61cd`, restoring a linear chain.

**Status:** Resolved.

---

### Issue 2: Voting System Redesign Mid-Development

**What happened:** The original 1–5 star voting system was implemented and then replaced with a binary heng/la system during the UI redesign phase.

**Why it mattered:** This required changes to the `Vote` model, `Post` model (repurposing `avg_score` to store `heng_rate`), all voting API logic, tier calculation, and frontend components simultaneously.

**Action taken:** The redesign was bundled into a single large merge (`87dd418`: `feat: UI重设计Phase1 + 二元投票 + 推荐Feed`) to avoid a prolonged inconsistent state. The change is documented in this report as a scope deviation.

**Status:** Resolved. The binary system is now fully operational.

---

### Issue 3: AI Service Dependency Risk

**What happened:** The DeepSeek API is an external dependency that could be unavailable or rate-limited during peak usage.

**Why it mattered:** If AI roast generation blocks post submission, the core user flow breaks.

**Action taken:** NFR-08 was implemented from the start — `ai_service.py` wraps the DeepSeek call in a try/except and returns a fallback comment string on any failure. Post submission always succeeds regardless of AI availability.

**Status:** Mitigated by design.

---

### Issue 4: Frontend White Screen Bug

**What happened:** Commit `2dee0a1` (`fix(home): 修复 handleRandomRoast 未定义导致白屏`) — a missing function reference caused the home page to crash on load.

**Why it mattered:** A white screen on the home page is a critical user-facing failure.

**Action taken:** The undefined function reference was identified and fixed immediately in a dedicated fix commit.

**Status:** Resolved.

---

## 7. Next Milestones and Task Assignment

| Task | Owner | Target Milestone |
|------|-------|-----------------|
| Expose Comment API (router + endpoints) | 贺柏诚 | M3 — Week 11 |
| Add integration tests for comment endpoints | 贺柏诚 | M3 — Week 11 |
| Increase frontend component test coverage (Home, FeedCard, Profile) | 范云杰 | M3 — Week 11 |
| Add CI coverage badge to README | 祝天皓 | M3 — Week 11 |
| Leaderboard UI polish and season history view | 魏嘉琦 | M3 — Week 11 |
| Production deployment stability (Railway backend + Vercel frontend) | 贺柏诚 | M4 — Week 13 |
| End-to-end demo script preparation | All members | M4 — Week 13 |
| Final report writing | All members | M5 — Week 15 |

---

*Report prepared by Group 13, Section EX1. Repository: https://github.com/BSAI301/course-project-ex1-team-13*
