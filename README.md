# ✅ Dawam Web
The Next.js frontend for Dawam — a daily task/habit tracker with sections, drag-to-reorder tasks, recurring-task tracking, a calendar view, and account management. Authenticates via Supabase and talks to the [Dawam-Tasks-Backend](https://github.com/xAdhm/Dawam-Tasks-Backend) Spring Boot API for all task data.

---

## 🛠️ Tech Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`) — email/password auth with cookie-based sessions, email confirmation via `/auth/confirm` route handler
- `@dnd-kit` (core/sortable/utilities) for drag-and-drop section reordering, task reordering within sections, and cross-section task dragging
- Tailwind CSS 4, `next-themes` for light/dark mode
- `next/font/google` for Nunito (wordmark only) and Geist (UI body)
- No local database or ORM — this app is a pure client for the separate `dawam` backend API

---

## ✅ Prerequisites
- Node.js 18+
- A Supabase project with email/password auth enabled (the same project used by the `dawam` backend, since both share the JWT/session)
- The [Dawam-Tasks-Backend](https://github.com/xAdhm/Dawam-Tasks-Backend) Spring Boot API running and reachable (locally on `:8080` by default)

---

## 🚀 Setup

### 1. Clone the repo
```bash
git clone https://github.com/xAdhm/Dawam-Tasks-Web.git dawam-web
cd dawam-web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```
All three are `NEXT_PUBLIC_*`, so they're bundled into client-side JS — none of them are secret (the anon key is meant to be public; real authorization happens via the user's JWT plus the backend's own auth checks). `.env*` is already in `.gitignore`. If `NEXT_PUBLIC_API_BASE_URL` is omitted, the API client falls back to `http://localhost:8080`.

### 4. Start the backend
This app has no API routes of its own for task data — it's a thin client. Start [Dawam-Tasks-Backend](https://github.com/xAdhm/Dawam-Tasks-Backend) first (`./mvnw spring-boot:run`, defaults to port 8080) so the frontend has something to call.

### 5. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

---

## 🗺️ Pages & Routes

### `/` — Today view (server component)
If there's no logged-in Supabase session, renders `LandingPage`. If logged in, the server component fetches the current Supabase access token, calls the backend for every section and its tasks (`GET /sections` then `GET /sections/{id}/tasks` per section, in parallel), and renders `TodayView` with the results. Also reads `?welcome=true` / `?passwordReset=true` query params to show a one-time dismissible banner after signup confirmation or password reset.

**Auth required:** Session cookie (renders the landing page if absent — no hard redirect).

---

### `/login`
Split-layout page: left panel shows an app UI mockup (desktop only), right panel contains the email/password sign-in form. Uses `supabase.auth.signInWithPassword`. Supports a `?email=` query param to prefill the email field (used when redirecting here after signup confirmation). On success, routes to `/`.

---

### `/signup`
Split-layout page: left panel shows feature highlights (desktop only), right panel contains the registration form. Registers via `supabase.auth.signUp`, storing `display_name` in Supabase user metadata and setting `emailRedirectTo` to `/auth/confirm`. Requires a 6+ character password and matching confirmation field. Does **not** call the `dawam` backend — signup is entirely a Supabase Auth operation.

---

### `/auth/confirm` (route handler, `GET`)
The email-confirmation link target. Exchanges the `code` query param for a real session via `supabase.auth.exchangeCodeForSession` — this is what actually logs the user in after clicking the confirmation email. Redirects to `/?welcome=true` on success or `/login` on failure.

---

### `/forgot-password`
Requests a Supabase password-reset email via `supabase.auth.resetPasswordForEmail`, with `redirectTo` set to `/reset-password`.

---

### `/reset-password`
The landing page for the reset-password email link. Calls `supabase.auth.updateUser({ password })` to set a new password (requires current password re-verification via `signInWithPassword` first), then redirects to `/?passwordReset=true`.

---

### `/calendar` (server component)
Fetches the current month's task data from `GET /calendar?start=&end=` and renders `CalendarView`. Supports month and week views. Days with tasks show dot indicators; past days with incomplete tasks are highlighted in pastel blue as overdue. Clicking a day opens a task panel with toggle support. Month navigation triggers a client-side re-fetch for the new month's range.

**Auth required:** Session cookie (redirects to `/login` if absent).

---

### `/settings`
Account settings page with three independent sections: edit display name (updates `user_metadata`), change email address (requires current password verification, sends confirmation email), and change password (requires current password verification). Each section has its own save button and inline success/error feedback. Accessible from the sidebar.

---

## 🔌 Backend API Integration
All task/section data goes through `src/lib/api/client.ts`, a typed wrapper around the `dawam` backend (base URL from `NEXT_PUBLIC_API_BASE_URL`). Every call requires the caller to pass the current Supabase access token, which is forwarded as `Authorization: Bearer <token>`:

| Function | Backend endpoint |
|---|---|
| `getSections(token)` | `GET /sections` |
| `createSection(name, token)` | `POST /sections` |
| `renameSection(sectionId, name, token)` | `PUT /sections/{id}` |
| `deleteSection(sectionId, token)` | `DELETE /sections/{id}` |
| `reorderSections(orderedIds, token)` | `PUT /sections/reorder` |
| `getTasks(sectionId, token)` | `GET /sections/{sectionId}/tasks` |
| `createTask(sectionId, data, token)` | `POST /sections/{sectionId}/tasks` |
| `updateTask(sectionId, taskId, data, token)` | `PUT /sections/{sectionId}/tasks/{taskId}` |
| `toggleTask(sectionId, taskId, token)` | `PUT /sections/{sectionId}/tasks/{taskId}/toggle` |
| `deleteTask(sectionId, taskId, token)` | `DELETE /sections/{sectionId}/tasks/{taskId}` |
| `reorderTasks(sectionId, orderedIds, token)` | `PUT /sections/{sectionId}/tasks/reorder` |
| `moveTask(sectionId, taskId, targetSectionId, token)` | `PUT /sections/{sectionId}/tasks/{taskId}/move` |
| `getCalendar(start, end, token)` | `GET /calendar?start={date}&end={date}` |

`apiFetch` throws a plain `Error(\`API error ${status}: ${body}\`)` on any non-OK response — there's no structured error type, so callers only get a string message to work with. A `204 No Content` response resolves to `undefined`.

---

## 🗃️ Data Models (TypeScript types, `src/lib/api/types.ts`)
```ts
type TaskType = 'ONE_TIME' | 'RECURRING'
type Frequency = 'DAILY' | 'SPECIFIC_DAYS'
type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

interface Section {
  id: string
  name: string
  position: number
}

interface Task {
  id: string
  sectionId: string
  title: string
  type: TaskType
  dueDate: string | null       // ISO datetime string (e.g. "2026-07-04T14:30:00"), not date-only
  completed: boolean
  frequency: Frequency | null
  daysOfWeek: DayOfWeek[] | null
  doneToday: boolean
  dueTodayFlag: boolean
  position: number
}
```
These mirror the `dawam` backend's `SectionResponse`/`TaskResponse` DTOs exactly — there's no local transformation layer.

---

## 📝 Notes for Developers
- **This repo has no database and almost no server-side logic of its own.** Auth is entirely Supabase's; task/section data is entirely the `dawam` Spring Boot API's. If something looks wrong with task data, check the backend first — this app just renders what it's given.

- **`middleware.ts` refreshes the Supabase session but doesn't enforce auth.** `updateSession` in `src/lib/supabase/middleware.ts` calls `supabase.auth.getUser()` to refresh cookies but never redirects based on the result — the only places unauthenticated users are kept off protected content are the `if (!user) return <LandingPage />` check in `src/app/page.tsx` and the explicit `redirect('/login')` in `/calendar` and `/settings`. If you add more authenticated pages, add your own auth check in each one.

- **`dueDate` is a full `LocalDateTime` (not `LocalDate`).** The backend stores and returns datetime strings (e.g. `"2026-07-04T14:30:00"`), not date-only strings. `src/lib/dueDate.ts` handles urgency labels in time-aware increments (minutes, hours, days). The custom `DateTimePicker` component (`src/components/DateTimePicker.tsx`) handles 12-hour format input with free-text minute entry.

- **Cross-section drag uses a single top-level `DndContext` for tasks.** `TodayView` nests a task-level `DndContext` inside a section-level `DndContext`. The task context spans all sections so a task can be dragged across section boundaries — it calls `moveTask` (which hits `PUT .../move` on the backend) for cross-section drops, and `reorderTasks` for same-section reorders.

- **`page.tsx` uses a non-null assertion on the session** (`session!.access_token`) right after confirming `user` exists. In the rare case a user object is present but the session has just expired/been revoked, this would throw rather than fail gracefully — worth wrapping in a null check before shipping something that depends on this path being rock-solid.

- **No client-side data caching or revalidation strategy** — `page.tsx` re-fetches all sections and their tasks server-side on every request. Fine at small scale, but note there's no `swr`/`react-query` or Next.js `revalidate` tagging in place if this grows.

- **Error handling from the API client is string-only.** `apiFetch` throws a generic `Error` with the raw response body as its message — there's no distinction between "not found," "unauthorized," and "validation failed" beyond parsing that string, so UI-level error handling is necessarily coarse.

- **Signup and password reset are 100% Supabase-managed** — this app never calls its own backend for auth. Keep that in mind if you ever need to sync user profile data (e.g. `display_name`) into the `dawam` backend's database; right now it only lives in Supabase's `auth.users` metadata.

- **`dawam-web` and `dawam` must point at the same Supabase project** for tokens to validate — the frontend's `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` and the backend's JWKS URL (hardcoded in its `application.properties`) need to agree, or every backend call will 401.

- **Supabase email rate limit.** The free-tier Supabase email service caps at 2 auth emails per hour (signup confirmations, password resets). This is fine for personal use but will break under any real load. To fix: configure a custom SMTP provider (e.g. Resend) in Supabase — requires a verified domain.