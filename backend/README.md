<div align="center">

# 🚀 Odyssey

**A real-time treasure hunt platform built for college events.**

Teams navigate between celestial bodies, solve puzzles, and race to the finish — all managed through a live admin dashboard.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-orange.svg)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-black.svg)](https://supabase.com)

</div>

---

## What is Odyssey?

Odyssey is a backend API for running **physical treasure hunt events** at colleges. Teams register, get assigned a random route through celestial bodies (islands), and solve code + puzzle challenges at each stop. An admin dashboard tracks every team's progress in real-time.

**Event flow:**
```
Register → L104 (Start) → Island 1 → Island 2 → Island 3 → Island 4 → L104 (Finish) → Case Study (offline)
```

---

## Features

### Team Experience
- **Registration** — Teams sign up via webhook (Google Apps Script form), get a random 5-stop route
- **Code verification** — Enter the code found at each celestial body to advance
- **Puzzle solving** — Answer domain-specific questions (mythology, quantum, space, etc.)
- **Lockout system** — Wrong code = 15 minute lockout with countdown timer
- **Progress tracking** — Visual progress through all 5 stops

### Admin Controls
- **Start / End event** — `POST /admin/start` and `POST /admin/end` with dual time enforcement
- **Unlock teams** — Instantly unlock any locked team
- **Send messages** — Direct messages to individual teams
- **Announcements** — Broadcast messages to all teams
- **Teams overview** — Live list of all teams with progress, status, and last solve time

### Security & Reliability
- **JWT authentication** — Symmetric token signing with `JWT_SECRET`
- **Rate limiting** — 5 attempts per 15 minutes on verify endpoints (fixed: was 1 min). Admin limiter: 30 attempts per 1 min.
- **Event gating** — Verify endpoints blocked until event starts, blocked after event ends
- **Duplicate name handling** — Auto-suffixes duplicate team names with `_<4-digit>`
- **Input validation** — Null guards, type checks, Express 5 compatible
- **Race condition fix** — Auto-unlock uses conditional UPDATE to prevent concurrent request races

### Infrastructure
- **Vercel-ready** — Serverless export with `module.exports = app` + listen guard
- **Supabase backend** — PostgreSQL database with real-time subscriptions
- **Email ready** — Resend integration (dormant until official sender configured)

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js 24                          |
| Framework   | Express 5.2.1                       |
| Database    | Supabase (PostgreSQL)               |
| Auth        | JWT (jsonwebtoken) + bcryptjs       |
| Rate Limit  | express-rate-limit                  |
| Email       | Resend                              |
| Module      | CommonJS                            |
| Deploy      | Vercel (serverless)                 |

---

## Project Structure

```
backend/
├── app.js                    # Express app, middleware, serverless export
├── routes/
│   ├── adminRoutes.js        # Admin endpoints (start, end, unlock, message, announce)
│   ├── authRoutes.js         # Login (JWT signing)
│   ├── eventRoutes.js        # GET /event (started_at, duration, ended_at)
│   └── teamRoutes.js         # Register, verify-code, verify-answer, state
├── middleware/
│   ├── auth.js               # requireAuth (JWT verify) + requireAdmin (x-admin-secret)
│   ├── eventStatus.js        # requireEventActive (checks start + end time)
│   └── rateLimit.js          # verifyLimiter (5 attempts / 15 min)
├── utils/
│   ├── teamState.js          # getTeamStateForUser + buildRandomRoute
│   └── email.js              # Resend welcome email (dormant)
├── db/
│   ├── supabaseClient.js     # Supabase client (service role key)
│   ├── teamModel.js          # Teams table helpers
│   └── migrations/           # SQL migrations (run in Supabase SQL Editor)
│       ├── ended_at.sql      # ALTER TABLE event_config ADD COLUMN ended_at
│       └── leaderboard.sql   # teams.last_correct_at + leaderboard VIEW
├── .env.example              # Environment variable template
├── package.json
└── LICENSE                   # MIT
```

---

## API Endpoints

### Public
| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/api/team/register` | Register a new team (webhook)   |
| POST   | `/api/login`         | Login and get JWT token          |
| GET    | `/api/event`         | Get event config (start, duration, end) |

### Team (requires Bearer token)
| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/team/state`     | Get current stage, clue, progress    |
| POST   | `/api/team/verify-code`   | Submit island code (rate limited) |
| POST   | `/api/team/verify-answer` | Submit puzzle answer (rate limited) |

### Admin (requires `x-admin-secret` header)
| Method | Endpoint                 | Description                    |
|--------|--------------------------|--------------------------------|
| POST   | `/api/admin/start`       | Start the event (sets time)    |
| POST   | `/api/admin/end`         | End the event (sets ended_at)  |
| GET    | `/api/admin/teams`       | List all teams + progress      |
| POST   | `/api/admin/unlock-team` | Instantly unlock a team        |
| POST   | `/api/admin/send-message`| Send message to a team         |
| POST   | `/api/admin/announce`    | Broadcast announcement         |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key

# Auth
JWT_SECRET=your-jwt-secret-min-32-chars
ADMIN_SECRET=your-admin-secret

# Webhook (Google Apps Script registration form)
WEBHOOK_SECRET=your-webhook-secret

# Email (dormant until configured)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=odyssey@yourdomain.com
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (with `teams`, `islands`, `questions`, `event_config`, `announcements` tables)
- (Optional) Resend account for emails

### Installation

```bash
# Clone the repo
git clone https://github.com/Harshbansal06/odyssey.git
cd odyssey/backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run migrations in Supabase SQL Editor
# 1. db/migrations/leaderboard.sql
# 2. db/migrations/ended_at.sql

# Start the server
node app.js
```

Server runs on `http://localhost:3005`.

---

## Database Schema

### Tables (managed in Supabase)

**teams**
| Column         | Type      | Notes                              |
|----------------|-----------|------------------------------------|
| id             | UUID      | Primary key                        |
| team_name      | text      | Unique                             |
| team_leader    | text      |                                    |
| members        | jsonb     | Array of names                     |
| password       | text      | bcrypt hash                        |
| route          | jsonb     | Array of {island_id, question_id}  |
| email          | text      |                                    |
| progress       | integer   | 0-5 (index into route)             |
| stage          | text      | awaiting_code / awaiting_puzzle    |
| status         | text      | active / locked / finished         |
| lock_until     | timestamptz |                                  |
| wrong_attempts | integer   |                                    |
| notice         | text      | Admin message                      |
| last_correct_at| timestamptz | For leaderboard tie-break       |

**islands**
| Column         | Type      | Notes                              |
|----------------|-----------|------------------------------------|
| id             | UUID/int  | Primary key                        |
| correct_code   | text      | Code to verify at this island      |
| clue_statement | text      | Shown to teams                     |
| is_common_room | boolean   | true = L104 (final stop)           |

**questions**
| Column            | Type | Notes                           |
|-------------------|------|---------------------------------|
| id                | UUID | Primary key                     |
| domain            | text | mytho, quantum, space, etc.     |
| question_statement| text | The puzzle                      |
| question_answer   | text | Correct answer                  |

**event_config**
| Column           | Type      | Notes                            |
|------------------|-----------|----------------------------------|
| id               | integer   | Always 1                         |
| started_at       | timestamptz | Set by POST /admin/start      |
| duration_minutes | integer   | Event duration                   |
| ended_at         | timestamptz | Set by POST /admin/end        |

### Migrations to run in Supabase SQL Editor

```sql
-- 1. Leaderboard support
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_correct_at timestamptz;

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT id, team_name, progress, status, lock_until, wrong_attempts, last_correct_at
FROM teams
ORDER BY progress DESC, last_correct_at ASC NULLS LAST;

-- 2. Event end support
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS ended_at timestamptz;
```

---

## How It Works

### Route Generation (`buildRandomRoute`)
1. Fetch all non-common-room islands → shuffle → pick 4
2. Fetch all question domains → shuffle
3. Pair each island with a random question from a unique domain
4. Add 1 random common-room island (L104) as the final stop
5. Store the 5-stop route on the team record

### Event Lifecycle
```
Pre-event:  started_at = null         → verify endpoints return 403 "not started"
Active:     started_at in past        → verify endpoints work normally
Post-event: ended_at set OR           → verify endpoints return 403 "ended"
            started_at + duration passed
```

### Team State Machine
```
Register → stage: awaiting_code → verify-code correct → stage: awaiting_puzzle
         → verify-answer correct → stage: awaiting_code (next island)
         → ... repeat for 5 stops ...
         → progress >= 5 → status: finished
         
Wrong code → status: locked, lock_until: now + 15min
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Framework: **Other** (not detected automatically)
4. Root directory: `backend`
5. Build command: _(leave empty)_
6. Output directory: _(leave empty)_
7. Add all env vars from `.env`
8. Deploy

The app exports `module.exports = app` and has a `if (require.main === module)` guard — works both as serverless function and standalone server.

---

## What's Next

- [ ] **Frontend** — React + Vite + Tailwind (design spec in `DESIGN_SPEC.md`)
- [ ] **Admin dashboard** — Team management, announcements, start/end controls
- [ ] **Admin map view** — Real-time team positions on venue map (Supabase Realtime)
- [ ] **Leaderboard** — Live ranking via Supabase VIEW + frontend subscription
- [ ] **Welcome emails** — Auto-send on registration (needs official sender)
- [ ] **Hints system** — Optional hints at each island
- [ ] **Export results** — CSV download of final leaderboard

---

## License

[MIT](LICENSE) — Harsh Bansal, 2026
