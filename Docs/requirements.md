# UniRoast — Requirements Document

## 1. Functional Requirements

### 1.1 User Authentication
| ID | Requirement |
|----|-------------|
| FR-01 | Users can register with a unique username, email, and password |
| FR-02 | Users can log in and receive a JWT token valid for 30 minutes |
| FR-03 | Protected routes require a valid JWT token |
| FR-04 | Passwords are stored as bcrypt hashes (never plaintext) |

### 1.2 Daily Challenges (Themes)
| ID | Requirement |
|----|-------------|
| FR-05 | Admins can create themed challenges with a title, description, and emoji |
| FR-06 | Each theme can be assigned an `active_date` to designate it as "today's challenge" |
| FR-07 | Users can view the current day's active theme |
| FR-08 | Users can browse all past themes |

### 1.3 Post Submission
| ID | Requirement |
|----|-------------|
| FR-09 | Authenticated users can submit a photo + caption for the active theme |
| FR-10 | Photos are uploaded to Cloudinary; only the URL is stored in the database |
| FR-11 | Accepted formats: JPEG, PNG, WebP, GIF; maximum size: 10 MB |
| FR-12 | Upon submission, the system automatically generates an AI roast comment via DeepSeek API |
| FR-13 | If the AI service is unavailable, a fallback comment is used and the post is still published |

### 1.4 Voting & Ranking
| ID | Requirement |
|----|-------------|
| FR-14 | Authenticated users can vote 1–5 stars on any post |
| FR-15 | The system calculates and stores the running average score per post |
| FR-16 | Each post is assigned a tier label based on its average score: 夯 (≥4.5), 顶级 (≥3.5), 人上人 (≥2.5), NPC (≥1.5), 拉完了 (<1.5) |
| FR-17 | The leaderboard displays posts sorted by average score (descending) |

### 1.5 User Profile
| ID | Requirement |
|----|-------------|
| FR-18 | Authenticated users can view their own profile page |
| FR-19 | The profile page lists all posts submitted by the user, with scores and tiers |

---

## 2. Non-Functional Requirements

### 2.1 Performance
| ID | Requirement |
|----|-------------|
| NFR-01 | API response time for read endpoints (feed, leaderboard) must be < 500 ms under normal load |
| NFR-02 | Image upload (excluding Cloudinary transfer time) must complete within 2 seconds |
| NFR-03 | The frontend initial load (LCP) must be < 3 seconds on a standard broadband connection |

### 2.2 Security
| ID | Requirement |
|----|-------------|
| NFR-04 | All API endpoints that modify data require JWT authentication |
| NFR-05 | JWT secrets are stored in environment variables, never hardcoded |
| NFR-06 | File uploads are validated for type and size before being sent to Cloudinary |
| NFR-07 | CORS is restricted to the known frontend origin in production |

### 2.3 Reliability
| ID | Requirement |
|----|-------------|
| NFR-08 | AI roast generation failure must not block post submission (graceful degradation) |
| NFR-09 | The CI pipeline must pass on every push before a PR can be merged |

### 2.4 Usability
| ID | Requirement |
|----|-------------|
| NFR-10 | The application must be usable on mobile screens (≥ 375 px width) |
| NFR-11 | The app is installable as a PWA on iOS and Android |

### 2.5 Maintainability
| ID | Requirement |
|----|-------------|
| NFR-12 | Database schema changes are managed via Alembic migrations |
| NFR-13 | Test coverage must be reported in CI for every build |
| NFR-14 | All environment-specific configuration is managed via `.env` files |
