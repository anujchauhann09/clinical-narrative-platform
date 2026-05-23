# SymptIQ — Clinical Narrative Platform

> AI-powered symptom intelligence. Turn day-to-day symptom logs into a structured, doctor-ready medical story.

---

## About

Modern medicine generates a flood of data scattered across portals, paper notes, and tracking apps. By the time a patient sits in front of a clinician, the chronological story — the actual signal — is gone.

**SymptIQ** is a clinical narrative platform that fixes that. Patients log symptoms in seconds; a deterministic insights engine surfaces correlations, severity trends, and triggers; an AI layer translates the structured data into a clinical narrative a doctor can read in under a minute; and a one-click PDF makes the visit itself useful.

It is built for the 12 minutes you get with a doctor — not for engagement metrics.

---

## Features

| Feature | What it does |
| --- | --- |
| **Symptom timeline** | Fast logging of severity, mood, triggers, attachments, and notes. Searchable chronological view. |
| **Insights engine** | Correlations, severity trends, day-of-week patterns, trigger frequency — all deterministic, no AI in the numbers. |
| **AI clinical narratives** | LLM-generated, doctor-ready summaries grounded in your actual entries. |
| **Clinical PDF reports** | One-click export to a clinician-formatted PDF with charts and AI summary attached. |
| **AI Copilot** | Chat with your own history. RAG over uploaded documents + logged data, scoped per-user. |
| **Visual analytics** | Theme-aware charts for severity, trigger frequency, symptom mix. |
| **Auth & audit** | Refresh-token rotation, CSRF protection, encrypted-in-transit, audit log on every PHI access. |

---

## Tech stack

**Backend** — Node.js 20+, Express 5, Prisma ORM, PostgreSQL, JWT auth (HttpOnly cookies + CSRF double-submit), Pino structured logging, Helmet, rate-limiting, Zod validation, Puppeteer for PDFs, Gemini API for AI, Pinecone for vector search.

**Frontend** — React 19, Vite, TailwindCSS, Zustand state, React Router 7, React Hook Form + Zod, Framer Motion, Recharts, Axios.

---

## File structure

```
clinical-narrative-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # data model
│   │   ├── migrations/            # versioned SQL migrations
│   │   └── seed.js                # dev seed data
│   ├── src/
│   │   ├── ai/                    # Gemini wrappers, prompt builders, copilot RAG
│   │   ├── app.js                 # Express app composition
│   │   ├── server.js              # HTTP server entry
│   │   ├── config/                # env schema (Zod), CORS, logger
│   │   ├── constants/             # cookie names, HTTP statuses, route literals
│   │   ├── controllers/           # request → service handlers
│   │   ├── database/              # Prisma client + transaction helpers
│   │   ├── errors/                # typed ApiError hierarchy
│   │   ├── middlewares/           # auth, csrf, rate-limit, sanitize, error
│   │   ├── pdf/                   # puppeteer-based PDF renderer
│   │   ├── repositories/          # Prisma-backed data access
│   │   ├── routes/                # versioned route registration
│   │   ├── services/              # business logic (auth, timeline, insights, copilot, audit, narrative)
│   │   ├── utils/                 # cookies, csrf, jwt, hashing, response helpers
│   │   └── validators/            # Zod schemas per endpoint
│   ├── docs/                      # backend-foundation.md, database-design.md
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                   # axios client + endpoint modules
│   │   ├── components/            # UI building blocks
│   │   ├── constants/             # app-wide constants & route literals
│   │   ├── context/               # React contexts
│   │   ├── hooks/                 # custom hooks
│   │   ├── layouts/               # app/auth/landing shells
│   │   ├── pages/                 # route-level screens
│   │   ├── routes/                # router config + guarded routes
│   │   ├── services/              # cross-cutting flows (signOut, motion presets)
│   │   ├── store/                 # zustand slices (auth, copilot, …)
│   │   ├── styles/                # Tailwind layers + tokens
│   │   ├── utils/                 # pure helpers
│   │   ├── validators/            # client-side Zod schemas
│   │   └── main.jsx               # entry
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Setup

### Prerequisites

- **Node.js ≥ 20**
- **PostgreSQL ≥ 14** running locally (or a connection string)
- **Gemini API key** (free tier works for development) — required for AI features
- **Pinecone account** *(optional)* — required only if you want copilot document upload + RAG

### 1. Clone and install

```bash
git clone https://github.com/anujchauhann09/clinical-narrative-platform
cd clinical-narrative-platform

# Backend deps (includes a ~170 MB Chromium download for puppeteer)
cd backend && npm install

# Frontend deps
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cd ../backend
cp .env.example .env
```

Open `.env` and fill in:

- `DATABASE_URL` — your local Postgres connection string
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/)
- `PINECONE_API_KEY` and `PINECONE_INDEX` *(optional)* — leave blank to disable copilot document upload

The frontend reads `VITE_API_BASE_URL` (defaults to `/api/v1`). For local dev with Vite's proxy this is fine; for split deploys see the Deployment section.

### 3. Database migration + seed

```bash
cd backend
npm run db:deploy      # apply migrations
npm run db:seed        # optional dev seed
```

### 4. Run

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

Open <http://localhost:5173> and sign up.

---

## Deployment

The app deploys as two independent services: a Node API and a static SPA. Tested on Render; the same approach works on Railway, Fly, Vercel + Render, etc.

### Backend

1. **Build command** — `npm ci && npx prisma generate && npx prisma migrate deploy`
2. **Start command** — `npm start`
3. **Required env vars** — everything from `.env.example`, plus:
   - `NODE_ENV=production` — **must be set** (controls cookie `Secure`/`SameSite`)
   - `CORS_ORIGINS=https://your-frontend-domain` — exact origin, no trailing slash
   - `DATABASE_URL` — managed Postgres URL
4. **Do not set** `CHROME_EXECUTABLE_PATH` — Puppeteer uses its bundled Chromium.

### Frontend (static host)

1. **Build command** — `npm ci && npm run build`
2. **Publish directory** — `dist`
3. **Env vars** (set at build time — Vite inlines them):
   - `VITE_API_BASE_URL=https://your-backend-domain/api/v1`

### Cross-origin checklist

The frontend and backend almost always end up on different origins in production. Make sure:

- Backend serves over **HTTPS** (cookies are `Secure=true` in prod)
- Backend `CORS_ORIGINS` contains the exact frontend origin
- Frontend `VITE_API_BASE_URL` points at the **HTTPS** backend
- Auth flow uses cookies (handled automatically by `withCredentials: true` and `app.set('trust proxy', 1)`)

### Migrations on deploy

`prisma migrate deploy` runs every build, so the database stays in sync with `schema.prisma`. Never run `migrate dev` in production.

---

## Best practices followed

**Security**
- HttpOnly + Secure + SameSite cookies for access/refresh tokens
- Refresh-token rotation; server-side revocation
- CSRF protection via double-submit cookie + `X-CSRF-Token` header (token returned in body for cross-origin SPAs)
- bcrypt password hashing
- Helmet security headers; CORS allow-list (no wildcards)
- Rate limiting at the edge
- Zod input validation on every endpoint
- Audit log on every PHI access, scoped to the authenticated user
- No PII (name/email) sent to AI APIs; only the minimum context required

**Architecture**
- Layered backend: route → controller → service → repository → Prisma
- Typed error hierarchy (`ApiError`) with central error middleware
- Single-source env config via Zod-validated schema — app fails fast on misconfig
- Versioned API prefix (`/api/v1`) and migration-driven schema changes
- Single-flight refresh on the frontend so concurrent 401s share one network call

**Frontend**
- Component composition over inheritance; presentation isolated from data
- Zustand for cross-cutting state; React Query-style patterns kept lean with axios interceptors
- Tailwind design tokens (no inline magic colors)
- Framer Motion for choreographed transitions; respects `prefers-reduced-motion`
- Form validation shared with backend via Zod schemas

**Operational**
- Structured Pino logs with request correlation
- Health-check route; PDF browser pool kept warm
- No tracking cookies, no analytics SDKs, no advertising integrations

---

## Open source

This project is licensed under the **ISC License**. Contributions are welcome:

1. Fork the repo and create a feature branch.
2. Run `npm install` in both `backend/` and `frontend/`.
3. Add tests for non-trivial changes (`npm test` in `backend/`).
4. Follow the existing code style — Zod schemas for any new input boundary, audit logging for any new PHI surface.
5. Open a PR describing **why** the change is needed.

For security-sensitive issues, please email the contact listed on the Privacy page rather than opening a public issue.
