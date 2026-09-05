# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Odyssey?

A real-time treasure hunt platform for college events. Teams register, get assigned a random 5-stop route through "celestial bodies" (islands), and solve code + puzzle challenges at each stop. An admin dashboard tracks every team's progress live.

Event flow: `Register → L104 (Start) → Island 1 → Island 2 → Island 3 → Island 4 → L104 (Finish)`

Repo is a monorepo with two independent apps, each with their own `node_modules`/`package.json`:
- `backend/` — Express 5 REST API (CommonJS), Supabase (Postgres) as the database
- `frontend/` — React 19 + Vite + Tailwind v4 SPA

## Commands

### Backend (`backend/`)
```bash
npm run dev          # start with --watch (auto-restart), port 3005
npm start            # start normally
npm test             # run full Jest suite
npx jest teamRoutes   # run tests matching a name/file pattern
npx jest tests/verifyCode.test.js   # run a single test file
```
Requires a `.env` (copy from `.env.example`) with `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, `ADMIN_SECRET`, `WEBHOOK_SECRET`, and optionally `RESEND_API_KEY`/`EMAIL_FROM`. Tests don't need real Supabase credentials — `tests/setup.js` stubs the required env vars and tests mock the Supabase client (see `tests/helpers/mockSupabase.js`, `mockSupabaseFactory.js`).

### Frontend (`frontend/`)
```bash
npm run dev      # Vite dev server, proxies /api -> http://localhost:3005 (see vite.config.js)
npm run build    # production build
npm run lint     # eslint .
npm run preview  # preview production build
```
Run backend and frontend dev servers concurrently in separate terminals for local full-stack development.

## Architecture

### Backend request flow
`app.js` wires four route modules under `/api`, in this order: `eventRoutes`, `authRoutes`, `teamRoutes`, `adminRoutes`. All are plain Express routers reading/writing through `db/supabaseClient.js` (service-role Supabase client) and `db/teamModel.js` (teams table helpers).

- **Auth**: symmetric JWT (`JWT_SECRET`) issued by `POST /api/login`, verified by `middleware/auth.js`'s `requireAuth` (Bearer token → `req.userId`). Admin routes instead use `requireAdmin`, which checks a static `x-admin-secret` header — this is a separate, non-JWT auth path.
- **Event gating**: `middleware/eventStatus.js`'s `requireEventActive` reads `event_config` (id=1) and 403s team-facing verify endpoints before `started_at` or after `ended_at`/`started_at + duration_minutes`, whichever is sooner. Any change to event timing logic must account for both the explicit `ended_at` and the computed duration deadline.
- **Rate limiting**: `middleware/rateLimit.js` — `verifyLimiter` allows 5 attempts per 15 minutes on verify endpoints; a separate admin limiter allows 30/min.
- **Team state machine** (`utils/teamState.js`): each team has `stage` (`awaiting_code` → `awaiting_puzzle` → back to `awaiting_code` for the next island) and `progress` (0–5, index into their `route`). A wrong code sets `status: locked` with `lock_until` = now + 15 min; unlock uses a conditional UPDATE to avoid races between concurrent requests (see `tests/concurrency.test.js`). `progress >= 5` sets `status: finished`.
- **Route generation** (`buildRandomRoute` in `utils/teamState.js`): picks 4 shuffled non-common-room islands, pairs each with a random question from a unique domain, then appends one common-room island (L104) as the final stop.
- **Serverless-compatible**: `app.js` exports `module.exports = app` and only calls `.listen()` under `if (require.main === module)`, so it runs both as a standalone Node server and as a Vercel serverless function. Root dir for Vercel deploys is `backend`.
- Errors are logged as structured JSON (timestamp, message, stack, method, url, ip, userId) in the final error-handling middleware in `app.js`.

Endpoints are listed in the root `README.md`. The DB schema (`teams`, `islands`, `questions`, `event_config`, `announcements`), the `leaderboard` view and the `get_team_state` RPC live as SQL in `backend/db/migrations/` (apply in order; `backend/db/seed.sql` is local fixture data only). Read them before making schema or endpoint changes.

### Frontend structure
- Routing is centralized in `src/App.jsx` using `react-router-dom`, with `ProtectedRoute` (requires `token` from `AuthContext`) and `GuestRoute` (redirects authenticated users away from landing/login) wrapper components.
- `src/context/AuthContext.jsx` owns auth state: `token`/`user` persisted to `localStorage` (`odyssey_token`, `odyssey_user`). On mount, if a token exists it re-fetches `/team/state` to hydrate the user and clears storage/logs out on failure.
- `src/api/client.js` is the sole Axios instance (`baseURL: '/api'`); a request interceptor attaches the Bearer token from `localStorage`, and a response interceptor force-logs-out and redirects to `/login` on any 401.
- Pages live in `src/pages/` (Landing, Login, Dashboard, Planet, Finished, Leaderboard, Admin, NotFound); shared UI primitives are in `src/components/ui/`; feature components (ClueCard, PuzzleCard, LockoutOverlay, AnnouncementBanner, StoryCards) are in `src/components/`.
- Tailwind v4 is wired via the `@tailwindcss/vite` plugin (not a PostCSS config) — see `vite.config.js`.
- `src/lib/anime.js` wraps `animejs` for animations; `src/supabaseClient.js` is a separate direct Supabase client used client-side (distinct from the backend's service-role client).

## Testing conventions (backend)

Jest tests live in `backend/tests/*.test.js`. Supabase is never hit directly — tests use hand-rolled mocks (`tests/helpers/mockSupabase.js`, `mockSupabaseFactory.js`) and JWT helpers (`tests/helpers/tokens.js`). When adding backend functionality that touches Supabase, extend the mock factory rather than reaching for a real database in tests.
