# Dawam — Daily Task & Routine Tracker

Dawam (دوام) means *continuity* in Arabic. It's a personal productivity app for tracking daily routines and task deadlines in one clean place.

**Live:** [dawam-tasks.vercel.app](https://dawam-tasks.vercel.app)

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Supabase Auth (email/password, JWT)
- dnd-kit (drag-and-drop)
- next-themes (dark/light mode)

**Backend**
- Spring Boot 4 (Java 17)
- Spring Security (OAuth2 Resource Server, JWT validation via Supabase JWKS)
- Spring Data JPA + Hibernate
- PostgreSQL (Supabase, connection pooler)
- Docker (deployed on Render)

---

## Features

- **Sections & Tasks** — organize tasks into custom sections, reorder via drag-and-drop
- **Recurring tasks** — daily or specific days of the week
- **One-time tasks** — with date + time deadlines and urgency badges
- **Calendar view** — month and week views with task indicators and overdue highlighting
- **Cross-section drag** — move tasks between sections
- **Account settings** — edit display name, email, and password
- **Dark & light mode** — persisted across sessions
- **Responsive** — mobile-first, works across all screen sizes

---

## Running Locally

### Prerequisites
- Node.js 18+
- Java 17
- Maven
- A [Supabase](https://supabase.com) project

### Frontend

```bash
git clone https://github.com/xAdhm/Dawam-Tasks-Web.git dawam-web
cd dawam-web
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

```bash
npm run dev
```

### Backend

```bash
git clone https://github.com/xAdhm/Dawam-Tasks-Backend.git dawam
cd dawam
```

Set the `DB_PASSWORD` environment variable (your Supabase database password), then run:

```bash
./mvnw spring-boot:run
```

Or via IntelliJ — run `DawamApplication`.

The backend connects to Supabase via the connection pooler (`*.pooler.supabase.com`) and validates JWTs against the Supabase JWKS endpoint.

---

## Deployment

- **Frontend** — Vercel (auto-deploys from `main`)
- **Backend** — Render (Docker, auto-deploys from `main`)
- **Database** — Supabase PostgreSQL

---

## Author

Adham Mustafa — [GitHub](https://github.com/xAdhm)