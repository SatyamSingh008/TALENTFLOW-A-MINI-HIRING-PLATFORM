# TalentFlow — Mini Hiring Platform (Front‑End)

TalentFlow is a front‑end React application that simulates a lightweight hiring platform. It focuses on rich client behavior, local persistence, and realistic API interactions via a mocked network layer. There is no real backend; all data persists locally.

## Tech Stack

- **Framework**: React 19 + Vite 7
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 3, PostCSS, Autoprefixer
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Persistence**: Dexie (IndexedDB)
- **Mock API**: MSW (Mock Service Worker)
- **Quality**: ESLint 9

Key configuration:
- `vite.config.js` – Dev/build setup
- `tailwind.config.js`, `postcss.config.js` – Styling pipeline
- `eslint.config.js` – Linting
- `public/_redirects` – Netlify SPA routing

## Core Product Flows

- **Jobs board**
  - List with server‑like pagination & filtering (title, status, tags)
  - Create job in a modal (required title, unique slug)
  - Archive/Unarchive
  - Reorder with drag‑and‑drop, optimistic UI updates with rollback on failure
  - Deep‑linking: `/jobs/:jobId`

- **Candidates**
  - Virtualized list (1,000+ records) with client‑side search
  - Candidate detail route with status timeline
  - Move candidates across stages on a kanban board (drag‑and‑drop)
  - Comments with `@mentions` (local only)

- **Assessments**
  - Per‑job assessments with multiple question types: single choice, multi choice, short text, long text, numeric with ranges, file upload (stub)
  - Persist assessment state and candidate responses locally
  - Basic analytics over responses

## Mock API Contract (MSW)

All endpoints are served via MSW with artificial latency and error behavior to mimic production.

- `GET /jobs?search&status&tags&page&size&sort`
- `POST /jobs` (title, slug, status: `active|archived`, tags: `string[]`)
- `PATCH /jobs/:id` (partial update)
- `PATCH /jobs/reorder` `{ fromOrder, toOrder }` (occasionally returns 500 to test rollback)

- `GET /candidates?search&stage&page`
- `POST /candidates` `{ id, name, email, stage: "applied"|"screen"|"tech"|"offer"|"hired"|"rejected" }`
- `PATCH /candidates/:id` (stage transitions, metadata)

- `GET /assessments?jobId`
- `PUT /assessments/:id` (question set)
- `POST /assessments/:jobId/submit` (store responses locally)

### Network Behavior
- Latency: 200–1200ms per request
- Error rate: 3–5% on write endpoints (POST/PATCH/PUT) to exercise optimistic UI and rollback

## Data & Persistence

- Seeded on first load:
  - 25 jobs (mix of `active` and `archived`)
  - 1,000 candidates randomly assigned to jobs and stages
  - 3 assessments with 10+ questions each
- All app state is stored in **IndexedDB** via Dexie and restored on refresh. MSW simulates the network boundary while Dexie serves as the durable source of truth on the client.

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+

### Install & Run
```bash
npm install
npm run dev
```
Dev server runs via Vite (see `vite.config.js`).

### Build & Preview
```bash
npm run build
npm run preview
```
Build artifacts output to `dist/`.


## Project Structure (high level)

- `src/` – Application code (routes, features, components)
- `public/` – Static assets and MSW worker (`mockServiceWorker.js`), SPA redirects (`_redirects`)
- Config at repo root: Vite, Tailwind, PostCSS, ESLint


- **Build failures**: Confirm Node 18+ locally and on Netlify.

## License

Add a suitable license (e.g., MIT) or keep the repo private if proprietary.
