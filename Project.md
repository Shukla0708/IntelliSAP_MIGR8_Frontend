# MIGR8 AI Frontend — Project Context

> Living document. Update this file whenever we make meaningful project decisions, add features, change architecture, or change tooling. Use it to stay aligned across sessions.

---

## Overview

| Field | Value |
| --- | --- |
| Project name | migr8-ai-frontend |
| Package name | `migr8-ai-frontend` |
| Repo path | `MIGR8_AI_frontend/` (workspace: `MIGR8 AI frontend`) |
| Purpose | Frontend for MIGR8 AI — SAP data migration assistant (UI from Google Stitch) |
| Status | Dual-scope nav: **Activity** (all my projects) + **Current project** tools; JWT auth; validation live; field-mapping / comparison mostly mock |
| Design source | Stitch project **Remix of MIGR8 AI Migration Assistant** (`11703829461598989849`) |
| Git | `main` — UI flows + axios; auth/validation/projects API wiring; dual-scope Activity hubs |
| API base | `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`) |
| Auth storage | `localStorage` key `migr8_token` |

---

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16.3.0** | App Router |
| Language | **TypeScript 5** | Strict mode on |
| UI / styling | **Tailwind CSS v4** | Via `@tailwindcss/postcss` |
| React | **React 19.2.8** | |
| Fonts | **Hanken Grotesk** + **JetBrains Mono** | Via `next/font/google` in `app/layout.tsx` |
| Lint | **ESLint 9** + `eslint-config-next` | |
| Package manager | **npm** | |
| Path alias | `@/*` → project root | Configured in `tsconfig.json` |
| Design tooling | **Stitch MCP** (`@_davideast/stitch-mcp`) | Source of truth for UI |
| HTTP client | **Axios 1.x** | Shared instance in `lib/axios.ts` |
| Excel parsing (client) | **xlsx** (SheetJS) | Header extraction only on `/validation/new` before API persist |
| Backend | **Python FastAPI** | Auth, projects, validation live; field-mapping / comparison APIs TBD |

### Explicit non-choices (for now)

- No `src/` directory — app lives at project root (`app/`)
- No third-party UI kit (custom components only)
- No state library or testing setup yet
- Auth is real (JWT via FastAPI); domain screens (validation live; mapping/compare still mock/static for project lists)
- **Dual-scope IA:** browse globally under Activity; create/execute always project-bound via selected project + picker

---

## Routes

Public (no JWT): `/sign-in`, `/register`. All other product routes live under `app/(app)/` and require auth (`middleware.ts` cookie check + `AuthGuard`).

| Route | Page file | View component | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | — | Redirects to `/dashboard` (also middleware-protected) |
| `/sign-in` | `app/sign-in/page.tsx` | `SignInCard` + `SystemStatus` | Public; real JWT login |
| `/register` | `app/register/page.tsx` | `RegisterCard` | Public; real JWT register |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | `DashboardView` | Global KPIs + recent activity (live validations) |
| `/projects` | `app/(app)/projects/page.tsx` | `ProjectsView` | Protected |
| `/activity/validations` | `app/(app)/activity/validations/page.tsx` | `ActivityValidationsList` | All my validations; Project column + filters |
| `/activity/comparisons` | `app/(app)/activity/comparisons/page.tsx` | `ActivityComparisonsList` | Cross-project comparisons (mock until API) |
| `/activity/mappings` | `app/(app)/activity/mappings/page.tsx` | `ActivityMappingsList` | Cross-project mappings (mock until API) |
| `/activity/reports` | `app/(app)/activity/reports/page.tsx` | `ActivityReportsList` | Stub |
| `/compare` | `app/(app)/compare/page.tsx` | `ComparisonRunsList` | Project-scoped prior runs + **New Comparison** |
| `/compare/new` | `app/(app)/compare/new/page.tsx` | `ComparisonSetupView` | Reconciliation upload; from New Comparison |
| `/compare/[id]` | `app/(app)/compare/[id]/page.tsx` | `ReconciliationReviewView` | Exception review; `generateStaticParams` |
| `/field-mapping` | `app/(app)/field-mapping/page.tsx` | `FieldMappingRunsList` | Project-scoped prior runs + **New Field Mapping** |
| `/field-mapping/new` | `app/(app)/field-mapping/new/page.tsx` | `FieldMappingSetupView` + `SchemaUploadPanel` | Source/target upload + SAP fetch; topbar title |
| `/field-mapping/[id]` | `app/(app)/field-mapping/[id]/page.tsx` | `FieldMappingWorkspaceView` | Multi-prospect mapping workspace; `generateStaticParams` |
| `/validation` | `app/(app)/validation/page.tsx` | `ValidationRunsList` | Project-scoped prior runs + **New Validation** |
| `/validation/new` | `app/(app)/validation/new/page.tsx` | `AdvancedValidationView` | Client-first wizard: name + local file staging + rules; persist on Save Draft / Run |
| `/validation/[id]` | `app/(app)/validation/[id]/page.tsx` | `AdvancedValidationView` (edit) | Resume draft: edit rules, replace file, run without re-staging |
| `/validation_result/[id]` | `app/(app)/validation_result/[id]/page.tsx` | `ValidationResultsView` | Per-run results; redirects drafts to `/validation/[id]` |
| `/report` | `app/(app)/report/page.tsx` | `ProjectReportView` | Project-scoped migration report (validation live; compare/map preview) |

### App shell UX

1. User lands on **Dashboard** (`/dashboard`) — global control center across all owned projects.
2. Sidebar / topbar stay mounted via `AppShell`.
3. Clicking a nav item replaces **main content only**.
4. Sidebar active state is derived from `usePathname()` + `matchPrefixes` (not hard-coded).
5. **Mobile:** sidebar is hidden on small screens; hamburger opens a drawer overlay (`AppShell` state).
6. **Dual scope:**
   - **Activity** — browse validations / comparisons / mappings / reports across all owned projects.
   - **Current project** — tools for the selected project (switcher in sidebar).
7. **Validation flow:**
   - Project: `/validation` → draft/runs open `/validation/{id}`; completed/failed open `/validation_result/{id}`; **New Validation** (project picker) → `/validation/new`
   - Global: `/activity/validations` → same routing via `validationRunHref()` in `lib/validation-routes.ts`
   - `/validation/new` stages name, file, and rules locally; **no DB row until Save Draft or Run Validation**
   - `/validation/[id]` loads saved draft via `GET /api/runs/{id}`; can replace file or run without re-selecting from disk
8. **Field Mapping flow:**
   - `/field-mapping` (project-scoped, **live** via `GET /api/mappings/?project_id=`) → detail `/field-mapping/{id}` (real `mappingRunId`, live); create gated by project picker → `/field-mapping/new` → number-range dialog → `/field-mapping/{mappingRunId}`
   - `/activity/mappings` (cross-project) is still mock (`PREVIOUS_FIELD_MAPPING_RUNS`) — no cross-project mapping-runs API yet
9. **Comparison flow:**
   - `/compare` or `/activity/comparisons` → detail `/compare/{id}`; create gated by project picker → `/compare/new` → `/compare/cmp-new`
10. Validation sidebar (project) stays active on `/validation*` and `/validation_result*`.
11. Activity → Validations stays active on `/activity/validations*`.
12. Field Mapping / Comparison project + activity items use their respective prefixes.

### Sidebar nav labels (current)

Defined in `data/dashboard.ts` (`SIDEBAR_OVERVIEW`, `SIDEBAR_ACTIVITY`, `SIDEBAR_PROJECT_TOOLS`, `SIDEBAR_FOOTER_NAV`); rendered in `components/layout/app-sidebar.tsx`:

| Section | Label | Href |
| --- | --- | --- |
| CTA | **Projects** | `/projects` |
| Overview | Dashboard | `/dashboard` |
| Activity | Validations | `/activity/validations` |
| Activity | Comparisons | `/activity/comparisons` |
| Activity | Field Mapping | `/activity/mappings` |
| Activity | Reports | `/activity/reports` |
| Current project | *(project switcher dropdown)* | selects `migr8_selected_project_id` |
| Current project | Validation | `/validation` (+ `/validation_result/*`) |
| Current project | Comparison | `/compare` |
| Current project | Field Mapping | `/field-mapping` |
| Current project | Reports | `/report` |
| Footer | Profile | menu (logout) |
| Footer | Settings | `#` (TBD) |

### Mock validation run IDs

| ID | Source | Notes |
| --- | --- | --- |
| `run-001` | `PREVIOUS_VALIDATION_RUNS` | Full source validation |
| `run-002` | `PREVIOUS_VALIDATION_RUNS` | Email & mandatory fields check |
| `run-003` | `PREVIOUS_VALIDATION_RUNS` | Key uniqueness sweep |
| `run-new` | `LATEST_VALIDATION_RUN_ID` | Target after **Run Validation Rules** |

### Mock field mapping run IDs

**Legacy fixtures** — `data/field-mapping-workspace.ts`'s `FIELD_MAPPING_WORKSPACES`/`PREVIOUS_FIELD_MAPPING_RUNS` are no longer used by the live `/field-mapping` flow (it fetches real `mappingRunId`s from the API); they're still referenced by `/activity/mappings` (mock) and `data/project-report.ts`'s mapping-preview aggregation.

| ID | Source | Notes |
| --- | --- | --- |
| `map-001` | `PREVIOUS_FIELD_MAPPING_RUNS` | Customer Master — full schema map |
| `map-002` | `PREVIOUS_FIELD_MAPPING_RUNS` | Address & contact fields |
| `map-003` | `PREVIOUS_FIELD_MAPPING_RUNS` | Payment terms mapping |
| `map-new` | `LATEST_FIELD_MAPPING_RUN_ID` | Unused by the live flow now — kept for the mock fixtures above |

### Mock comparison run IDs

| ID | Source | Notes |
| --- | --- | --- |
| `cmp-001` | `PREVIOUS_COMPARISON_RUNS` | Customer Master — postload vs preload |
| `cmp-002` | `PREVIOUS_COMPARISON_RUNS` | Material Master reconciliation |
| `cmp-003` | `PREVIOUS_COMPARISON_RUNS` | Vendor Master delta check |
| `cmp-new` | `LATEST_COMPARISON_RUN_ID` | Target after **Run Reconciliation** |

---

### Field Mapping setup (`/field-mapping/new`)

| Card | Key UI |
| --- | --- |
| Source Field List | File upload (`.csv`, `.xlsx`) — **Select Source File** |
| Target Field List | File upload — **Select Target File**; **OR** divider + **Fetch from SAP** (table name input + **Fetch** button, mock) |

Topbar: `AI Mapping: Upload Source & Target Schemas` (`FIELD_MAPPING_TOPBAR_TITLE`).

Submitting opens `NumberRangeDialog` (`components/field-mapping/number-range-dialog.tsx`) first — user picks `"internal"` or `"external"` number range (required by the backend's `number_range_type` form field). On confirm, `field-mapping-setup-view.tsx` calls `createMappingRun(projectId, sourceFile, targetFile, numberRangeType)` (`lib/mapping-api.ts`) and `router.push` to the real `/field-mapping/{mappingRunId}` returned by the API — not a mock id.

### Field Mapping workspace (`/field-mapping/[id]`)

`FieldMappingWorkspaceView` (`components/field-mapping/field-mapping-workspace-view.tsx`) is fully API-driven: the page fetches `fetchMappingRunResult(id)` then `toFieldMappingWorkspace(result, projectName)` (both in `lib/mapping-api.ts`).

- **Per-row selection** — each AI-suggested row is a native radio group (one prospect selected at a time); picking a radio updates that row's Confidence Breakdown / Semantic Similarity / Datatype Match / AI Reasoning in the side panel live, since those now read from the *selected* prospect's own data rather than a fixed "top candidate" snapshot.
- **Key fields under an internal number range** (`row.requiresManualMapping`) skip the radio list entirely — `ManualTargetPicker` shows the current pick (or "Not selected") plus a button that opens a `Dialog` (`components/ui/dialog.tsx`) listing **every** target field with its description (filterable by a search box inside the dialog, not required before anything shows).
- **Badges** — rows show a "Key Field" badge when `row.keyField` is true, and an "Approved" badge when `row.confirmed` is true (derived from the API's `confirmedTargetField`, i.e. already present in `final_mapping`).
- **Single approve action** — one "Approve Mapping" button in the header confirms every row's current selection in one `confirmMapping()` call. It's disabled (and shows "All fields must be mapped before approving." if forced) whenever any row has no `selectedProspectId`. On success it navigates back to `/field-mapping` (the runs list). There is no per-row approve/reject button anymore.

### Comparison setup (`/compare/new`)

| Card | Key UI |
| --- | --- |
| Upload Preload File | Dashed upload zone (primary) — **Select File** |
| Upload Postload File | Dashed upload zone (secondary) — **Select File** |
| Conditional metadata | **Have Field Mapping?** checkbox reveals per-card metadata upload (JSON, CSV) |

Topbar: project name breadcrumb (`COMPARISON_PROJECT_NAME`). **Run Reconciliation** → `/compare/cmp-new`.

### Validation setup (`/validation/new` and `/validation/[id]`)

| Step | Key UI | Persistence |
| --- | --- | --- |
| Run name | `TextField` — unique per project, locks when file attached | Local on create; locked on edit |
| Source file | `SourceUploadZone` — drag/drop or browse (`.xlsx`, `.xls`, `.csv`) | Local until save/run; edit shows saved filename + **Replace File** |
| Column headers | Parsed in browser via `lib/parse-source-headers.ts` (`xlsx` + CSV first line) | Local on create; loaded from API on edit |
| Rules table | `ValidationRulesTable` + **Define Rules** dialog; supports `initialRules` on edit | Local until save/run |
| **Save Draft** | Sticky footer | Create: `persistValidationRun()`; Edit: `updateValidationDraft()` (upload only if new file) |
| **Run Validation Rules** | Sticky footer | Save draft chain, then `POST /execute` → `/validation_result/{id}` |

Routing:
- List cards use `validationRunHref()` — `draft` / `rules_configured` → `/validation/{id}`; `completed` / `failed` / `running` → `/validation_result/{id}`
- `/validation_result/{id}` redirects back to `/validation/{id}` if run is still a draft

Notes:
- Selecting a file on **create** does not call `POST /api/runs/`.
- On **edit**, run validation works with the server-stored file (no local `File` required).
- Re-saving or running with a newly selected file re-uploads via `POST /upload`.

### Comparison review (`/compare/[id]`)

| Section | Key UI |
| --- | --- |
| Summary cards | Matched Records, Different, Missing |
| Discrepancy table | Business Key, Field, Preload/Postload values, Difference Type, Status |
| Actions | Download Comparison Report (mock), View Exceptions (scroll to table) |

---

## Project Structure

```
MIGR8_AI_frontend/
├── app/
│   ├── globals.css              # Tailwind + Stitch Enterprise Blue tokens
│   ├── layout.tsx               # Root layout (fonts + metadata + AppProviders)
│   ├── page.tsx                 # Redirect → /dashboard
│   ├── sign-in/page.tsx         # Public
│   ├── register/page.tsx        # Public
│   ├── (app)/                   # Protected route group (AuthGuard layout)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── activity/
│   │   │   ├── validations/
│   │   │   ├── comparisons/
│   │   │   ├── mappings/
│   │   │   └── reports/
│   │   ├── compare/
│   │   ├── field-mapping/
│   │   ├── validation/
│   │   ├── validation_result/
│   │   └── report/
│   └── favicon.ico
├── middleware.ts                # Cookie gate: migr8_token required except sign-in/register
├── components/
│   ├── auth/
│   │   ├── auth-guard.tsx       # Client guard + /me hydration gate
│   │   ├── sign-in-card.tsx
│   │   ├── sign-in-form.tsx     # POST /api/auth/login
│   │   ├── register-card.tsx
│   │   ├── register-form.tsx    # POST /api/auth/register
│   │   └── system-status.tsx    # Sign-in page footer status strip
│   ├── activity/
│   │   ├── activity-validations-list.tsx
│   │   ├── activity-comparisons-list.tsx
│   │   ├── activity-mappings-list.tsx
│   │   └── activity-reports-list.tsx
│   ├── providers.tsx            # AuthProvider → ProjectProvider
│   ├── brand/
│   │   └── migr8-logo.tsx       # Uses /brand/migr8-logo.png
│   ├── dashboard/
│   │   ├── dashboard-view.tsx   # Live KPIs + recent activity (client)
│   │   ├── kpi-card.tsx         # KPI cards + SectionCard
│   │   ├── recent-projects.tsx
│   │   └── migration-readiness.tsx
│   ├── comparison/
│   │   ├── comparison-runs-list.tsx
│   │   ├── comparison-setup-view.tsx
│   │   ├── reconciliation-upload-panel.tsx
│   │   └── reconciliation-review-view.tsx
│   ├── field-mapping/
│   │   ├── field-mapping-runs-list.tsx
│   │   ├── field-mapping-setup-view.tsx
│   │   ├── field-mapping-workspace-view.tsx
│   │   └── schema-upload-panel.tsx
│   ├── validation/
│   │   ├── validation-runs-list.tsx
│   │   ├── advanced-validation-view.tsx
│   │   ├── source-upload-zone.tsx
│   │   ├── validation-rules-table.tsx
│   │   ├── advanced-rules-dialog.tsx   # Define Rules modal
│   │   └── validation-results-view.tsx
│   ├── layout/
│   │   ├── app-shell.tsx        # Sidebar + topbar + mobile drawer
│   │   ├── app-sidebar.tsx
│   │   └── app-topbar.tsx
│   ├── projects/
│   │   ├── projects-view.tsx
│   │   ├── create-project-dialog.tsx
│   │   └── project-picker-dialog.tsx  # Gate create flows to a project
│   ├── reports/
│   │   ├── project-report-view.tsx
│   │   ├── report-pillar-section.tsx
│   │   ├── validation-report-section.tsx
│   │   ├── comparison-report-section.tsx
│   │   └── mapping-report-section.tsx
│   ├── providers.tsx            # AuthProvider → ProjectProvider
│   └── ui/
│       ├── button.tsx
│       ├── text-field.tsx
│       ├── dialog.tsx
│       ├── icons.tsx            # Shared SVG icons (incl. Tag, Phone, Help, Check, Info)
│       ├── progress.tsx         # ProgressBar + CircularProgress
│       └── password-strength-meter.tsx
├── data/
│   ├── dashboard.ts             # Nav, KPIs, recent projects, readiness
│   ├── comparison.ts            # Runs, reconciliation upload cards, project name
│   ├── comparison-results.ts    # Review summaries, discrepancies, mock run IDs
│   ├── field-mapping.ts         # Runs, schema cards (incl. sapFetch), topbar title
│   ├── field-mapping-workspace.ts # Workspace rows, prospects, AI review mock data
│   ├── validation.ts            # Runs, field rules, rule config types
│   ├── validation-results.ts    # Per-run result summaries + exceptions
│   └── project-report.ts        # Report types + mock compare/map aggregators
├── contexts/
│   ├── auth-context.tsx         # useAuth — user/token/login/register/logout
│   └── project-context.tsx      # Selected project (mock list for now)
├── lib/
│   ├── axios.ts                 # Shared axios + Bearer + 401 → sign-in
│   ├── auth-api.ts              # login / register / fetchMe
│   ├── auth-storage.ts          # localStorage + migr8_token cookie sync
│   ├── auth-types.ts            # AuthUser / AuthResponse types
│   ├── parse-source-headers.ts  # Client-side Excel/CSV header extraction for validation
│   ├── project-report-api.ts    # fetchProjectReport — API + mock compare/map merge
│   ├── validation-api.ts        # fetch/create/upload/rules/execute helpers
│   ├── validation-routes.ts     # validationRunHref + isEditableValidationStatus
│   └── use-default-project.ts   # Selected project for validation create flows
├── public/
│   ├── brand/migr8-logo.png
│   ├── avatars/user.png
│   └── *.svg                    # Next.js scaffold assets
├── stitch-assets/               # Local Stitch HTML/screenshots (gitignored)
├── .env.example                 # Committed env template (backend URL)
├── .env.local                   # Local env overrides (gitignored)
├── .cursor/mcp.json             # Stitch MCP config (local; gitignored; may contain secrets)
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── eslint.config.mjs
├── package.json
├── Project.md
├── AGENTS.md / CLAUDE.md        # Next.js agent guidance
└── README.md                    # Default create-next-app readme (not product docs)
```

---

## API client (FastAPI backend)

Shared axios instance: `lib/axios.ts`. Import and use for all backend calls:

```ts
import apiClient, { setToken, clearToken, getApiErrorMessage } from "@/lib/axios";

const { data } = await apiClient.get("/api/projects/");
await apiClient.post("/api/auth/login", { email, password });
```

| Setting | Value |
| --- | --- |
| Env var | `NEXT_PUBLIC_API_BASE_URL` |
| Default | `http://localhost:8000` (FastAPI dev default) |
| Local config | `.env.local` (gitignored) |
| Auth header | `Authorization: Bearer <migr8_token>` via request interceptor |
| Token storage | `localStorage` key `migr8_token` |
| Selected project | `localStorage` key `migr8_selected_project_id` |

### Wired vs mock

| Area | Status |
| --- | --- |
| Auth (`/sign-in`, `/register`, `/api/auth/me`) | Live |
| Projects (`/projects` list + create + sidebar switcher) | Live via `ProjectProvider` |
| Validation list / upload / rules / execute / results / download | Live |
| Activity validations (`GET /api/runs/`) | Live cross-project for current user |
| Dashboard KPIs / recent activity | Live for projects + validations; compare still mock-augmented |
| Project report (`GET /api/projects/{id}/report` + mock merge) | Live validation KPIs; compare preview from fixtures (mapping preview also still reads mock `FIELD_MAPPING_WORKSPACES`, not the live API — see Open Questions) |
| Field mapping (`/field-mapping` list, `/field-mapping/new` create, `/field-mapping/[id]` workspace, confirm) | **Live** — `lib/mapping-api.ts` end to end; `/activity/mappings` (cross-project) still mock |
| Comparison (project + activity lists) | UI mock (friend's screens) until APIs exist |

`AppProviders` wraps `AuthProvider` → `ProjectProvider`. Validation uses `useDefaultProject()` which reads the selected project from context. **Browse** can be global; **create** always confirms a project via `ProjectPickerDialog`.

### Cross-project runs

| Item | Value |
| --- | --- |
| List all | `GET /api/runs/?project_id=&limit=&offset=` |
| Scope | Current JWT user only (join through owned projects) |
| Card fields | `id`, `name`, `records`, `ranAt`, `status`, `errors`, `project_id`, `project_name` |

### Validation run create contract

| Item | Value |
| --- | --- |
| Create | `POST /api/runs/?project_id={id}` with JSON body `{ "name": "<trimmed>" }` |
| Detail | `GET /api/runs/{run_id}` — name, status, `source_filename`, `has_source_file`, `fields[]` with rules |
| Upload | `POST /api/runs/{run_id}/upload` — multipart `file` |
| Rules | `PUT /api/runs/{run_id}/rules` — array of `FieldRuleIn` |
| Execute | `POST /api/runs/{run_id}/execute` |
| Uniqueness | Name must be unique **per project**; backend returns `409` with a clear `detail` if duplicate |
| List | `GET /api/projects/{id}/runs` and `GET /api/runs/` return real statuses (`draft`, `rules_configured`, etc.) |
| UI staging | `/validation/new` requires name before file select; file + rules stay local until **Save Draft** or **Run Validation** |
| UI edit | `/validation/[id]` loads draft via `fetchValidationRun()`; run without local file if `has_source_file` |
| UI lock | Run name locks when a source file is attached (staged or saved) |
| Frontend helpers | `persistValidationRun()`, `updateValidationDraft()`, `validationRunHref()` in `lib/` |

Notes:
- `NEXT_PUBLIC_` prefix is required for client components (`"use client"`).
- Restart `npm run dev` after changing env vars.
- Request interceptor attaches `Authorization: Bearer <token>` from `lib/auth-storage.ts`.
- Response interceptor on `401` clears session and redirects to `/sign-in` (skips login/register endpoints).

### Auth session

| Piece | Behavior |
| --- | --- |
| Token | JWT from FastAPI login/register |
| Storage | `localStorage` (`migr8_token`, `migr8_user`) + cookie `migr8_token` for middleware |
| Context | `useAuth()` — available under `AppProviders` |
| Middleware | Missing cookie → `/sign-in?next=…`; cookie on public auth pages → `/dashboard` |
| AuthGuard | Validates via `GET /api/auth/me` on hydrate; blocks product UI until authenticated |
| Post-auth | Sign-in/register → `/dashboard` (or `next` query on sign-in) |
| Logout | Sidebar Profile menu → `POST /api/auth/logout` + clear session → `/sign-in` |

---

## AppShell API

`components/layout/app-shell.tsx` props:

| Prop | Type | Use |
| --- | --- | --- |
| `children` | `ReactNode` | Main page content |
| `topbarTitle` | `string?` | Replaces search bar with a page title |
| `topbarLeading` | `ReactNode?` | Custom breadcrumb / project label (validation, field-mapping workspace, comparison routes) |
| `mainClassName` | `string?` | Override main padding/layout (e.g. sticky footers on validation/field-mapping) |

---

## Design system (Stitch Enterprise Blue)

Tokens live in `app/globals.css` (`:root` + `@theme inline`). Key values:

| Token | Value | Use |
| --- | --- | --- |
| `--primary` | `#004da4` | Links, accents, solid actions |
| `--primary-container` | `#0064d2` | Primary buttons, brand marks |
| `--secondary` / `--secondary-container` | `#4648d4` / `#6063ee` | Secondary accents, chart bars |
| `--background` / `--surface` | `#f9f9ff` | App canvas |
| `--surface-container-lowest` | `#ffffff` | Cards |
| `--surface-container-high` | `#e1e8fd` | Hover states |
| `--error` | `#ba1a1a` | Validation errors |
| `--tertiary` | `#8a3500` | Warnings / mismatches |
| `--success` | `#10b981` | Strong password / success badges |

Shared UI: `Button`, `TextField`, `Dialog`, icons (`TagIcon`, `PhoneIcon`, `HelpIcon`, `CheckIcon`, `InfoIcon`, etc.), `ProgressBar` / `CircularProgress`, `PasswordStrengthMeter`, `SectionCard`.

---

## Stitch screens implemented

| Stitch title | Screen ID | App route / location |
| --- | --- | --- |
| Sign In | `a6a315fdc7ce47dabd6df8a5c1d35fe9` | `/sign-in` |
| Register | `888050980ca440b6bf42cabe82fba5ad` | `/register` |
| Migration Control Center Dashboard | `262acc49650e4ca98c8d45cc00ba8aa9` | `/dashboard` |
| AI Field Mapping Setup | `cac35d70b9ca451cb5af37e5f88875e4` | `/field-mapping/new` |
| AI Field Mapping Workspace (Multi-Prospect View) | `52c54e1486504e40bee362a260b0f905` | `/field-mapping/[id]` |
| Reconciliation Upload with Conditional Metadata | `f9ae00b981bb4b9faf0cd90736646cc2` | `/compare/new` |
| Reconciliation & Exception Review (Updated Nav) | `d2bc367f18d44a228e999f0b91ac1d5a` | `/compare/[id]` |
| Advanced Validation & Results | `5861531b2f924a2abb62e112ceacda14` | `/validation/new` |
| Advanced Validation Rules Configuration | `674ecec8e0304b25ab8ea3aabacfa8c1` | Dialog on `/validation/new` (Define Rules) |
| Validation Results Analysis (Updated Nav) | `38ab412ecfeb44d998088e41c2089e31` | `/validation_result/[id]` |

---

## Commands

```bash
npm run dev      # Local dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

---

## Session Log

### 2026-08-13 — Field mapping workspace: single approve action, key-field/approved badges, live AI review, manual-picker popup

- `FieldMappingWorkspaceView`: removed the old per-row "Approve Mapping" / "Edit Target" / "Reject" footer entirely. One header-level **Approve Mapping** button now confirms every row's current selection in a single `confirmMapping()` call; it's blocked (button disabled + inline error) if any row has no `selectedProspectId`. On success it `router.push`es back to `/field-mapping`.
- Fixed a real bug: the AI Mapping Review side panel's Confidence Breakdown / Semantic Similarity / Datatype Match / Reasoning were frozen to the *first* (top) candidate's data regardless of which radio button was selected, because they read a static `row.aiReview` computed once from `prospects[0]`. `MappingProspect` (`data/field-mapping-workspace.ts`) now carries `semanticSimilarity`, `datatypeMatch`, `reasoning`, `targetDescription` per prospect (populated in `toFieldMappingWorkspace`, `lib/mapping-api.ts`), and the panel reads from the currently `selectedProspect` instead — so changing the radio now live-updates the whole panel. `row.aiReview` is still computed for backward compat with `data/project-report.ts`'s mock aggregation, but the workspace view no longer reads it.
- Added a "Key Field" badge (from `row.keyField`) and an "Approved" badge (from `row.confirmed`, derived from the API's `confirmedTargetField`) next to each source field name in the mapping table.
- Replaced `ManualTargetPicker`'s type-to-filter box (which showed nothing until you typed) with a button that opens a `Dialog` (`components/ui/dialog.tsx`) listing **every** target field with its description; an optional search box inside the dialog narrows the list, but browsing without typing now works.
- Backend contract addition consumed here: `GET /{run_id}/result` rows now include `confirmedTargetField` (see backend `Project.md`).

### 2026-08-13 — Project report screen (`/report`)

- Wired **Current project → Reports** to `/report` (sidebar `matchPrefixes: ["/report"]`).
- Added `ProjectReportView` with readiness ring, needs-attention card, KPI grid, and three pillar sections.
- Validation pillar uses live `GET /api/projects/{id}/report`; comparison/mapping use mock aggregates with **Preview data** badges.
- Composite readiness: Validation 50% + Comparison 25% + Mapping 25% (client-side merge in `project-report-api.ts`).

### 2026-08-13 — Resume validation drafts (`/validation/[id]`)

- Backend: `GET /api/runs/{run_id}` returns run detail + field rules; list endpoints expose real `draft` / `rules_configured` statuses.
- Frontend: new `/validation/[id]` edit route reuses `AdvancedValidationView` with `editRunId`.
- Drafts open from list via `validationRunHref()`; completed runs still go to `/validation_result/{id}`.
- Edit mode: load saved rules, show server filename, **Replace File**, run validation without re-staging local file.
- `/validation_result/{id}` redirects editable drafts back to `/validation/{id}`.

### 2026-08-13 — Deferred validation draft creation (client-first wizard)

- `/validation/new` no longer creates a run on file select; `SourceUploadZone` parses headers locally via `lib/parse-source-headers.ts` (`xlsx` + CSV).
- Added `lib/validation-api.ts` — `persistValidationRun()` chains `POST /api/runs/` → `POST /upload` → `PUT /rules`.
- **Save Draft** is enabled; persists without execute. **Run Validation Rules** persists then `POST /execute`.
- Run name locks after file is staged locally; duplicate names surface as `409` on save/run only.
- Added `xlsx` dependency for client-side header extraction.

### 2026-08-13 — Dual-scope nav (Project work + Global activity)

- Sidebar: **Overview** (Dashboard) + **Activity** (all my validations/comparisons/mappings/reports) + **Current project** tools with inline project switcher.
- Backend: `GET /api/runs/` lists current user’s validation runs across projects (`project_id` / `project_name`, optional filter).
- `/activity/validations` live list with Project column, search, project filter; compare/mapping/reports activity pages (mock/stub).
- `ProjectPickerDialog` gates **New** create flows so work always lands under an explicit project.
- Dashboard wired to live project + validation aggregates; recent activity feed; View All → `/projects`.
- Project-scoped lists link to “View all projects’ …” activity hubs.

### 2026-08-13 — Unique validation run names

- `/validation/new` collects a **Validation Run Name** before source file select.
- `POST /api/runs/?project_id=...` sends `{ name }` on explicit save/run (not on file select).
- Name field locks after a source file is staged; duplicate names surface backend `409` via `getApiErrorMessage` on save/run.
- Documented create contract under API client section (backend enforces required `name` + unique `(project_id, name)`).

### 2026-08-13 — Profile logout

- Sidebar Profile opens a menu with Logout; calls `POST /api/auth/logout`, clears JWT/cookie, redirects to `/sign-in`.

### 2026-08-13 — JWT auth context + protected routes

- Wired sign-in/register to FastAPI (`/api/auth/login`, `/api/auth/register`).
- Added `AuthProvider` / `useAuth`, `auth-storage` (localStorage + cookie), axios Bearer + 401 handling.
- Added `middleware.ts` + `app/(app)` `AuthGuard` so unauthenticated users cannot open product URLs.
- `/` redirects to `/dashboard`; signed-in users hitting auth pages redirect to dashboard.

### 2026-08-13 — Project.md full refresh (comparison E2E complete)

- Brought Overview, routes, comparison setup/review sections, mock IDs, structure, and sidebar labels in line with latest codebase.
- Documented full comparison flow: runs list → upload setup → exception review.
- Updated sidebar parent label to **Project 1**; topbar button to **Projects**.

### 2026-08-12 — Reconciliation & Exception Review (`/compare/[id]`)

- Implemented `/compare/[id]` from Stitch **Reconciliation & Exception Review (Updated Nav)** (`d2bc367f18d44a228e999f0b91ac1d5a`).
- Summary cards (Matched / Different / Missing), discrepancy table, Download + View Exceptions actions.
- **Run Reconciliation** → `/compare/cmp-new`; prior runs link to `/compare/{id}`.
- Mock data in `data/comparison-results.ts`.

### 2026-08-12 — Reconciliation Upload with Conditional Metadata (`/compare/new`)

- Implemented `/compare/new` from Stitch **Reconciliation Upload with Conditional Metadata** (`f9ae00b981bb4b9faf0cd90736646cc2`).
- Preload/postload dashed upload cards with conditional field metadata sections.
- **Have Field Mapping?** checkbox toggles metadata upload UI; **Run Reconciliation** navigates to `/compare/cmp-new`.

### 2026-08-12 — Comparison runs list (`/compare`)

- Added `/compare` page mirroring validation/field-mapping: previous runs + **New Comparison** button.
- Sidebar **Comparison(Postload <-> Preload)** → `/compare`; active on `/compare*`.
- Mock runs in `data/comparison.ts`; links to `/compare/new` and `/compare/{id}`.

### 2026-08-12 — Project.md full refresh (field mapping complete)

- Brought Overview, routes, field mapping setup details, mock IDs, structure, and session log in line with latest codebase.
- Documented full field mapping flow: runs list → setup (with SAP fetch) → workspace.
- Updated git status, AppShell `topbarLeading` usage, and shared icons list.

### 2026-08-12 — AI Field Mapping Setup refresh (Stitch)

- Updated `/field-mapping/new` to match latest Stitch: topbar title, Target Field List card, Select Target File button.
- Added OR divider + Fetch from SAP input on target card (`schema-upload-panel.tsx`).

### 2026-08-12 — AI Field Mapping Workspace (Multi-Prospect View)

- Implemented `/field-mapping/[id]` from Stitch **AI Field Mapping Workspace (Multi-Prospect View)** (`52c54e1486504e40bee362a260b0f905`).
- Mapping table with source → target prospects, confidence badges, search/filter bar, and AI review panel.
- **Start Mapping** on `/field-mapping/new` → `/field-mapping/map-new`; prior runs link to `/field-mapping/{id}`.
- Mock workspace data in `data/field-mapping-workspace.ts`.

### 2026-08-12 — Field Mapping runs list + `/field-mapping/new`

- `/field-mapping` now mirrors `/validation`: previous runs list + **New Field Mapping** button.
- Moved schema upload setup to `/field-mapping/new` (`FieldMappingSetupView`).
- Added `FieldMappingRunsList`, mock runs in `data/field-mapping.ts`; sidebar active on `/field-mapping*`.

### 2026-08-12 — Axios API client + env setup

- Added `axios` dependency and `lib/axios.ts` shared instance for future FastAPI integration.
- Created `.env.example` (committed) and `.env.local` (gitignored) with `NEXT_PUBLIC_API_BASE_URL`.
- Updated `.gitignore` to allow `.env.example` while keeping other `.env*` files private.

### 2026-08-12 — Project.md full refresh

- Brought structure, routes, component map, AppShell API, mock run IDs, and git status in line with the codebase.
- Documented all validation/field-mapping/dashboard component files.
- Clarified `public/brand` + `public/avatars` assets and `.cursor/mcp.json` gitignore.

### 2026-08-12 — Validation Results Analysis

- Implemented `/validation_result/[id]` from Stitch **Validation Results Analysis (Updated Nav)** (`38ab412ecfeb44d998088e41c2089e31`).
- Prior runs on `/validation` link to `/validation_result/{run.id}`.
- **Run Validation Rules** on `/validation/new` navigates to `/validation_result/run-new`.
- Mock per-run summaries in `data/validation-results.ts`; Validation nav stays active via `matchPrefixes`.

### 2026-08-12 — Advanced Validation Rules Configuration dialog

- Stitch screen **Advanced Validation Rules Configuration** (`674ecec8e0304b25ab8ea3aabacfa8c1`) implemented as a modal on `/validation/new`.
- **Define Rules** opens dialog; **Apply Rules** writes tags onto the field row.
- Data types: `char | int | decimal | string | boolean`.
- Length disabled for `string` (max 255 when enabled); Decimal Length only when `decimal`.

### 2026-08-12 — Validation runs + Advanced Validation & Results

- `/validation`: simple previous-runs list + **New Validation** (not Stitch-advanced).
- `/validation/new`: Stitch **Advanced Validation & Results** (`5861531b2f924a2abb62e112ceacda14`) — upload zone, rules table, sticky Save Draft / Run Validation.
- Sidebar **Validation** → `/validation`; active for `/validation/*` via pathname.
- Reuses `AppShell`; topbar supports `topbarLeading` for project breadcrumb.

### 2026-08-12 — Project.md refresh + Field Mapping nav labels

- Brought Overview, structure, routes, design system, and TBD sections up to date.
- Sidebar child labels: Validation · Comparison(Postload <-> Preload) · Field Mapping · Reports.

### 2026-08-12 — AI Field Mapping Setup from Stitch

- Originally implemented at `/field-mapping`; later moved to `/field-mapping/new` when runs list was added.
- Reuses `AppShell` (sidebar + topbar); upload cards + sticky **Start Mapping** (mock).
- Refreshed per latest Stitch: Target Field List, Select Target File, Fetch from SAP.

### 2026-08-11 — Migration Control Center Dashboard from Stitch

- Implemented `/dashboard` from Stitch **Migration Control Center Dashboard** (`262acc49650e4ca98c8d45cc00ba8aa9`).
- Added reusable app shell (sidebar + topbar), KPI grid, recent projects, readiness ring.
- Mock data in `data/dashboard.ts`; extended surface / semantic tokens.

### 2026-08-11 — Register from Stitch

- Implemented `/register` from Stitch **Register** (`888050980ca440b6bf42cabe82fba5ad`).
- Reused `Button`, `TextField`; added size / `trailingAction`, password strength meter.
- Linked Sign In ↔ Register footers.

### 2026-08-11 — Sign In from Stitch

- Implemented `/sign-in` from Stitch **Sign In** (`a6a315fdc7ce47dabd6df8a5c1d35fe9`).
- Added `Button`, `TextField`, icons, `Migr8Logo`, auth card/form.
- Wired Enterprise Blue tokens + fonts; mock form only.

### 2026-08-11 — Initial scaffold

- Created Next.js app (TypeScript, Tailwind v4, App Router, ESLint, `@/*`).
- No `src/` directory; `Project.md` added as living context.

---

## Decisions & Conventions

1. **App Router only** — use `app/` routes; do not introduce Pages Router.
2. **TypeScript everywhere** — prefer `.ts` / `.tsx`; keep `strict` enabled.
3. **Tailwind for styling** — prefer utilities; shared tokens/components when patterns repeat.
4. **Stitch is UI source of truth** — match layout, spacing, typography, and color from Stitch HTML/screenshots.
5. **Shared app chrome** — authenticated product screens use `AppShell`; nav stays while main content swaps.
6. **Reuse before inventing** — extend existing `components/ui` and layout pieces; avoid duplicate components.
7. **Auth is real; domain data still mock where APIs missing** — use `useAuth` + Bearer token for APIs; keep fixtures in `data/` until domain endpoints are wired.
8. **Page → view split** — route files stay thin (`metadata` + `AppShell` wrapper); screen logic lives in `components/*/`-view files.
9. **Single axios instance** — import `apiClient` from `@/lib/axios`; do not create ad-hoc axios instances elsewhere.
10. **Protected product routes** — put authenticated pages under `app/(app)/`; keep `/sign-in` and `/register` public.
11. **Selected project is global** — `ProjectProvider` is source of truth; validation must not invent a parallel project ID.
12. **Validation run names are user-provided and unique per project** — UI requires `name` on create; backend must enforce uniqueness (prefer `409` on conflict).
13. **Validation create is client-first** — `/validation/new` stages file and rules locally; call backend only on **Save Draft** or **Run Validation** via `lib/validation-api.ts`.
14. **Validation drafts are resumable** — `draft` / `rules_configured` runs open at `/validation/[id]`; use `validationRunHref()` for list links.
15. **Dual-scope IA** — Activity hubs browse across all owned projects; Current project tools do day-to-day work; create/execute always requires an explicit project (picker or selected).
15. **Global lists are per signed-in user only** — no cross-user/org sharing until a sharing model exists.
16. **Keep `Project.md` current** — after meaningful changes, update structure/routes/decisions and append a session log entry.
17. Prefer small, focused changes over broad refactors unless requested.

---

## Open Questions / TBD

- Wire remaining sidebar routes: Settings
- Wire compare API; replace `/activity/comparisons` and `/activity/mappings` mock lists (project-scoped field mapping is already wired)
- `data/project-report.ts`'s mapping-preview aggregation still reads mock `FIELD_MAPPING_WORKSPACES`/`aiReview`, not the live `/api/mappings` data — reconcile once the report screen needs real mapping KPIs
- No per-run "list/edit confirmed fields" UI beyond reopening the workspace (matches backend: no un-confirm endpoint yet either)
- httpOnly cookie / refresh tokens (currently Bearer + readable cookie for middleware)
- Remove dead validation mock fixtures after cutover
- Optional nested URLs `/projects/[id]/validation` later (flat routes + context for now)
- Team/org sharing (out of scope for current per-user model)
- Deployment target
- Testing strategy

---

## Change Checklist (for future agents / sessions)

When making changes, update this file if any of the following apply:

- [ ] New dependency or major version bump
- [ ] New folder / architectural pattern
- [ ] New feature or route
- [ ] Convention or decision change
- [ ] Resolved TBD / open question
