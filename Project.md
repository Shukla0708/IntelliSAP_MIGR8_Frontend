# MIGR8 AI Frontend — Project Context

> Living document. Update whenever we make meaningful project decisions, add features, change architecture, or change tooling.

---

## Overview

| Field | Value |
| --- | --- |
| Project name | migr8-ai-frontend |
| Package name | `migr8-ai-frontend` |
| Repo path | `IntelliSAP_MIGR8_Frontend/` |
| Purpose | Frontend for MIGR8 AI — SAP data migration assistant (UI from Google Stitch) |
| Status | **Live:** auth, projects, validation, comparison, field mapping, dashboard, report, chat. Legacy mock fixtures remain in `data/` for name fallbacks only. |
| Design source | Stitch project **Remix of MIGR8 AI Migration Assistant** |
| API base | `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`) |
| Auth storage | `localStorage` `migr8_token` + cookie for middleware |

---

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16.3.0** | App Router |
| Language | **TypeScript 5** | `strict: true` |
| UI / styling | **Tailwind CSS v4** | Via `@tailwindcss/postcss` |
| React | **React 19.2.8** | |
| Fonts | **Hanken Grotesk** + **JetBrains Mono** | `app/layout.tsx` |
| HTTP | **Axios 1.19.0** | `lib/axios.ts` |
| Excel (client) | **xlsx** (SheetJS) | Header extraction on `/validation/new` only |
| Backend | **Python FastAPI** | All domain APIs wired |

### Explicit non-choices

- No `src/` directory — app lives at project root
- No third-party UI kit (custom components)
- No Redux/Zustand — React Context + local state
- No test setup yet
- Dual-scope IA: Activity (cross-project) + Current project tools

---

## Routes

Public: `/sign-in`, `/register`. All product routes under `app/(app)/` require auth (`middleware.ts` + `AuthGuard`).

| Route | Page file | View component | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | — | Redirects to **`/sign-in`** |
| `/sign-in` | `app/sign-in/page.tsx` | `SignInCard` | JWT login |
| `/register` | `app/register/page.tsx` | `RegisterCard` | JWT register |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | `DashboardView` | Live KPIs + activity |
| `/projects` | `app/(app)/projects/page.tsx` | `ProjectsView` | Live |
| `/activity/validations` | `activity/validations/page.tsx` | `ActivityValidationsList` | Live |
| `/activity/comparisons` | `activity/comparisons/page.tsx` | `ActivityComparisonsList` | Live |
| `/activity/mappings` | `activity/mappings/page.tsx` | `ActivityMappingsList` | Live |
| `/validation` | `validation/page.tsx` | `ValidationRunsList` | Project-scoped |
| `/validation/new` | `validation/new/page.tsx` | `AdvancedValidationView` | Client-first wizard |
| `/validation/[id]` | `validation/[id]/page.tsx` | `AdvancedValidationView` | Edit draft |
| `/validation_result/[id]` | `validation_result/[id]/page.tsx` | `ValidationResultsView` | Polls while running |
| `/compare` | `compare/page.tsx` | `ComparisonRunsList` | Project-scoped |
| `/compare/new` | `compare/new/page.tsx` | `ComparisonSetupView` | |
| `/compare/[id]` | `compare/[id]/page.tsx` | `ReconciliationReviewView` | Polls while running |
| `/field-mapping` | `field-mapping/page.tsx` | `FieldMappingRunsList` | Live |
| `/field-mapping/new` | `field-mapping/new/page.tsx` | `FieldMappingSetupView` | |
| `/field-mapping/[id]` | `field-mapping/[id]/page.tsx` | `FieldMappingWorkspaceView` | Polls while processing |
| `/report` | `report/page.tsx` | `ProjectReportView` | Live API report |

**Not implemented:** `/activity/reports` (no route; Reports lives under Current project → `/report`).

### Sidebar nav (`data/dashboard.ts`)

| Section | Items |
| --- | --- |
| CTA | **Projects** → `/projects` |
| Overview | Dashboard → `/dashboard` |
| Activity | Validations, Comparisons, Field Mapping |
| Current project | Project switcher + Validation, Comparison, Field Mapping, **Reports** → `/report` |
| Footer | Profile (logout), Settings `#` |

---

## Project Structure

```
IntelliSAP_MIGR8_Frontend/
├── app/
│   ├── globals.css              # Tailwind + Stitch Enterprise Blue tokens
│   ├── layout.tsx               # Fonts + AppProviders
│   ├── page.tsx                 # Redirect → /sign-in
│   ├── sign-in/, register/
│   └── (app)/                   # Protected routes
│       ├── dashboard/, projects/, report/
│       ├── activity/{validations,comparisons,mappings}/
│       ├── validation/, validation_result/
│       ├── compare/, field-mapping/
├── middleware.ts                # Cookie gate: migr8_token
├── components/
│   ├── auth/                    # sign-in, register, auth-guard
│   ├── activity/                # cross-project lists
│   ├── chat/                    # results-chat-drawer.tsx
│   ├── dashboard/               # dashboard-view, kpi-card, needs-attention-panel, skeleton
│   ├── comparison/
│   ├── field-mapping/
│   ├── layout/                  # app-shell, sidebar, topbar, job-toast
│   ├── projects/
│   ├── reports/                 # project-report-view, collapsible-pillar, pillar content
│   ├── validation/
│   ├── ui/                      # button, dialog, icons, progress, job-waiting-screen
│   └── providers.tsx            # AuthProvider → ProjectProvider
├── contexts/
│   ├── auth-context.tsx
│   └── project-context.tsx      # User-scoped selected project in localStorage
├── data/                        # Types + nav config; legacy mock fixtures
├── lib/
│   ├── axios.ts                 # Bearer + 401 → sign-in
│   ├── auth-api.ts, auth-storage.ts
│   ├── validation-api.ts, validation-routes.ts
│   ├── comparison-api.ts, comparison-routes.ts
│   ├── mapping-api.ts
│   ├── project-report-api.ts    # Thin wrapper → GET /api/projects/{id}/report
│   ├── chat-api.ts
│   ├── job-tracker.ts           # sessionStorage background job banner
│   ├── format-metrics.ts        # formatCompact() for KPIs
│   ├── parse-source-headers.ts
│   └── use-default-project.ts
├── package.json
├── Project.md
└── next.config.ts
```

---

## API Client Layer

Shared instance: `lib/axios.ts`

| Setting | Value |
| --- | --- |
| Env var | `NEXT_PUBLIC_API_BASE_URL` |
| Default | `http://localhost:8000` |
| Auth | `Authorization: Bearer <migr8_token>` |
| 401 | Clears session → `/sign-in` |

| File | Purpose |
| --- | --- |
| `validation-api.ts` | create/upload/rules/execute; `trackJob` on execute; upload `timeout: 0` |
| `comparison-api.ts` | list/create/upload/execute/result/download; `runComparison()` chain |
| `mapping-api.ts` | create/list/stats/result/confirm/target-fields; `toFieldMappingWorkspace()` |
| `project-report-api.ts` | `fetchProjectReport()` — no mock merge |
| `chat-api.ts` | `POST /api/chat/` |

### Wired vs mock

| Area | Status |
| --- | --- |
| Auth, projects | **Live** |
| Validation (full flow) | **Live** |
| Comparison (full flow) | **Live** |
| Field mapping (full flow) | **Live** |
| Activity lists (all three) | **Live** |
| Dashboard + project report | **Live** (all KPIs from API) |
| Chat assistant | **Live** |
| SAP table fetch on mapping setup | **Mock** (`console.info` only) |
| Legacy `data/*.ts` fixtures | Name fallbacks / dead exports only |

---

## Auth & Project Context

### Auth

- JWT from FastAPI login/register
- `localStorage`: `migr8_token`, `migr8_user`
- Cookie `migr8_token` (24h, SameSite=Lax) for `middleware.ts`
- `AuthGuard` hydrates via `GET /api/auth/me`

### Project context

- `GET /api/projects/` — list + create
- Selected project: `migr8_selected_project_id_{userId}` in localStorage
- Clears/refetches on user change (logout/login as different user)
- `useDefaultProject()` for report and validation flows

---

## State Management

1. **React Context** — auth, project list/selection
2. **Local `useState` + `useEffect`** — page-level fetching
3. **Route polling** — every **2s** while `running`/`processing` on result pages
4. **Job tracker** — `sessionStorage` `migr8.trackedJobs`; `JobReadyBanner` polls every **5s**
5. **Thin pages** — route files wrap `AppShell`; logic in `*-view.tsx` components

### Job tracking

| Mechanism | Interval | Status endpoint |
| --- | --- | --- |
| Result page poll | 2s | `GET /api/runs/{id}/result`, `/api/comparisons/{id}/result`, `/api/mappings/{id}/result` |
| JobReadyBanner | 5s | Same endpoints when user navigates away |

---

## Key UI Patterns

### Dashboard (`/dashboard`)

- **4-column grid:** KPI grid + recent projects + activity feed (left 3 cols) | readiness ring + needs-attention panel (right 1 col)
- Live data from validations, comparisons, mapping stats
- `DashboardSkeleton` while loading
- `max-w-[1200px]` centered layout

### Project report (`/report`)

- Same grid pattern as dashboard
- Left: KPI grid + **collapsible pillars** (Validation open by default, Comparison, Mapping)
- Right: compact `MigrationReadiness` + `NeedsAttentionPanel`
- Fully API-driven via `fetchProjectReport()`
- Status badge: Healthy / Needs attention / Getting started

### Validation results (`/validation_result/[id]`)

- Health score, KPI cards, errors-by-type/field charts
- Exception table (capped samples from API) + search
- **Download Full Report (.xlsx)** → presigned URL for annotated workbook (all rows + `Validation_Failure_Reason`)
- Polls while `status === "running"`

### Field mapping workspace

- Per-row radio prospects; manual picker dialog for internal key fields
- Single **Approve Mapping** confirms all rows
- Polls until `awaiting_approval` or `completed`

### Comparison review

- Summary cards + discrepancy table
- Download annotated preload report
- Polls while `running`

### Chat

- Floating `ResultsChatDrawer` in `AppShell`
- Context from current page (dashboard, report, validation, mapping)
- `POST /api/chat/`

---

## Design System

Tokens in `app/globals.css` (Stitch Enterprise Blue):

| Token | Value | Use |
| --- | --- | --- |
| `--primary` | `#004da4` | Links, accents |
| `--primary-container` | `#0064d2` | Primary buttons |
| `--secondary-container` | `#6063ee` | Chart bars |
| `--background` | `#f9f9ff` | Canvas |
| `--error` | `#ba1a1a` | Errors |
| `--tertiary` | `#8a3500` | Warnings |
| `--success` | `#10b981` | Success badges |

Shared: `Button`, `TextField`, `Dialog`, `icons.tsx`, `ProgressBar`, `SectionCard`, `JobWaitingScreen`, `JobReadyBanner`, `shadow-ambient`.

---

## Environment

| Variable | Required | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:8000` |

Create `.env.local` (gitignored). Restart `npm run dev` after changes.

**Storage keys:** `migr8_token`, `migr8_user`, `migr8_selected_project_id_{userId}`, `migr8.trackedJobs` (sessionStorage).

---

## Local Dev

```bash
cd IntelliSAP_MIGR8_Frontend
npm install
# .env.local:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

npm run dev    # http://localhost:3000
```

Backend must be running on port 8000.

```bash
npm run build
npm run start
npm run lint
```

---

## Decisions & Conventions

1. **App Router only** — no Pages Router.
2. **Stitch is UI source of truth** for layout and tokens.
3. **Shared app chrome** — `AppShell` for authenticated screens.
4. **Single axios instance** — `lib/axios.ts`.
5. **Protected routes** under `app/(app)/`.
6. **Selected project is global** — `ProjectProvider` is source of truth.
7. **Validation create is client-first** — persist on Save Draft or Run only.
8. **Dual-scope IA** — Activity browses cross-project; Current project tools require selection.
9. **Async jobs** — execute returns 202; poll result pages; job banner when navigating away.
10. **Keep `Project.md` current** after meaningful changes.

---

## Open Questions / TBD

- Settings page (`#` in sidebar)
- Paginated full-row validation report in UI (today: exception samples + Excel download)
- httpOnly cookie / refresh tokens
- Remove dead mock fixtures in `data/`
- Live SAP target fetch on `/field-mapping/new`
- Delete `report-pillar-section.tsx` (replaced by `collapsible-pillar.tsx`)
- Testing strategy
- Deployment target

---

## Session Log

### 2026-08-14 — Project.md refresh

- Synced with codebase: all pillars live, dashboard/report shared 4-col layout, `NeedsAttentionPanel`, `CollapsiblePillar`, user-scoped project switcher, `/` → sign-in, removed `/activity/reports`.

### 2026-08-14 — Dashboard & report UX redesign

- Shared layout: KPI/activity/pillars left (3 cols) + readiness + needs-attention right (1 col).
- Report uses collapsible Validation/Comparison/Mapping pillars; fully API-driven.
- `format-metrics.ts`, `dashboard-skeleton.tsx`, `needs-attention-panel.tsx`.

### 2026-08-14 — Large-file validation + job tracking

- Validation execute async; results page polls; `JobReadyBanner` + `job-tracker.ts`.
- Upload `timeout: 0` for large files.

### 2026-08-14 — Project switcher stale data fix

- `project-context.tsx` clears state on logout; refetches on user change; user-scoped localStorage key.

### 2026-08-13 — Field mapping, comparison, chat, report

- Field mapping workspace: single approve, manual key picker, live AI review panel.
- Comparison E2E via `comparison-api.ts`.
- Chat drawer grounded on page context.
- Project report wired to live validation KPIs (later: full API for all pillars).

### 2026-08-13 — JWT auth + dual-scope nav

- `middleware.ts`, `AuthGuard`, `ProjectProvider`.
- Activity hubs + project-scoped tools.

### 2026-08-12 — Validation wizard + results

- Client-first `/validation/new`; resume drafts at `/validation/[id]`.
- Validation results page with download.

### 2026-08-11 — Initial Stitch screens

- Sign-in, register, dashboard scaffold.

---

## Change Checklist

Update this file when you change:

- [ ] New dependency or major version bump
- [ ] New route or navigation item
- [ ] API wiring (mock → live or new endpoint)
- [ ] Auth / project context behavior
- [ ] Design tokens or shared components
- [ ] Resolved TBD item
