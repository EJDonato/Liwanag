# Liwanag — System Design

> **Status:** Draft v0.1
> **Related:** [PRD.md](./PRD.md)
> The stack below is a recommendation. If your course requires a specific stack, see section 9 for swap-in alternatives.

## 1. Summary

Liwanag is a small, content-heavy website with a form-driven backend and its own database. Traffic is low and the data is sensitive, so the design favors **simplicity, security, and a single deployable app** over microservices or heavy infrastructure.

| Layer | Choice |
|---|---|
| Framework (frontend + backend) | **Next.js 14+ (App Router)** with **TypeScript** |
| Styling | **Tailwind CSS** (design tokens for the "light" palette) |
| UI components | **shadcn/ui** (accessible, Radix-based) |
| Forms and validation | **React Hook Form** + **Zod** (same schemas on client and server) |
| Database | **PostgreSQL** |
| ORM and migrations | **Prisma** |
| Admin authentication | **Auth.js (NextAuth)** credentials provider, bcrypt/argon2 hashing |
| Hosting | **Vercel** (app) + **Supabase** (managed Postgres); local via Docker |
| Testing | **Vitest** (unit), **Playwright** (end-to-end) |
| Tooling | ESLint, Prettier, Git + GitHub, GitHub Actions |

## 2. Architecture Overview

A **monolithic full-stack app**: one Next.js codebase serves the public pages, handles form submissions, and exposes the admin area. The database is the only external dependency.

```
                    ┌─────────────────────────────────────────┐
                    │              Browser (user)             │
                    │  Public pages · Forms · Admin dashboard │
                    └───────────────────┬─────────────────────┘
                                        │ HTTPS
                    ┌───────────────────▼─────────────────────┐
                    │          Next.js application            │
                    │                                         │
                    │  ┌───────────────┐  ┌────────────────┐  │
                    │  │ Server-rendered│  │ Server Actions │  │
                    │  │ pages (RSC)    │  │ / Route Handlers│ │
                    │  └───────┬───────┘  └───────┬────────┘  │
                    │          │   Zod validation │           │
                    │          └────────┬─────────┘           │
                    │            ┌──────▼──────┐              │
                    │            │ Service layer│  (business   │
                    │            │              │   logic)     │
                    │            └──────┬──────┘              │
                    │            ┌──────▼──────┐              │
                    │            │ Prisma ORM  │              │
                    │            └──────┬──────┘              │
                    │   Auth.js (sessions) · Middleware        │
                    └───────────────────┬─────────────────────┘
                                        │ TLS
                    ┌───────────────────▼─────────────────────┐
                    │          PostgreSQL database            │
                    └─────────────────────────────────────────┘
```

There is no email integration. Contact messages are stored in the database and read by staff in the admin dashboard.

### Why a monolith
- Small team, short timeline, low traffic.
- One repo, one deploy, one language (TypeScript), with shared validation schemas between client and server.
- Easy to demo and explain in a school setting.

## 3. Framework Rationale

| Decision | Why | Alternatives considered |
|---|---|---|
| **Next.js** | Pages and backend in one project; server rendering gives fast loads and good SEO; Server Actions make forms simple | Express + React (two projects to run); Laravel (good, but different language) |
| **TypeScript** | Catches errors early; types flow from DB schema to forms | Plain JavaScript |
| **Tailwind + shadcn/ui** | Fast to build a consistent, accessible UI; easy to set a custom calm palette | Bootstrap, plain CSS |
| **React Hook Form + Zod** | Multi-step forms with clear validation; one schema validates both client and server | Formik, manual validation |
| **Auth.js** | Mature session handling for the admin area, so there is no hand-rolled auth | Custom JWT |

## 4. Database Choice

### Recommendation: PostgreSQL

| Reason | Detail |
|---|---|
| Relational fit | Clients, forms, services, testimonies, and messages have clear relationships and foreign keys |
| Integrity | Constraints, transactions, and enums protect sensitive records |
| Flexible form data | `JSONB` columns store questionnaire answers without a table per question |
| Free managed option | Supabase has a free tier with a built-in table editor and SQL editor; Docker works locally |
| Good ORM support | Prisma has first-class Postgres support |

### Alternatives

| Option | When to choose it |
|---|---|
| **SQLite** | Simplest setup (a single file), ideal if hosting is local only. Prisma supports it, so migrating to Postgres later is a config change. |
| **MySQL / MariaDB** | If the course or XAMPP setup requires it. Prisma supports it. |
| MongoDB | Not recommended. The data is relational, and integrity matters more than schema flexibility. |

### Schema (Prisma-style sketch)

```prisma
model Client {
  id            String   @id @default(cuid())
  referenceCode String   @unique
  fullName      String
  email         String?
  phone         String?
  birthdate     DateTime?
  createdAt     DateTime @default(now())

  consent    ConsentForm?
  privacy    PrivacyForm?
  interview  InterviewForm?
  assessment AssessmentForm?
  exit       ExitForm?
}

model ConsentForm {
  id           String   @id @default(cuid())
  clientId     String   @unique
  client       Client   @relation(fields: [clientId], references: [id])
  agreements   Json
  guardianName String?
  signature    String
  signedAt     DateTime @default(now())
}

model PrivacyForm {
  id              String   @id @default(cuid())
  clientId        String   @unique
  client          Client   @relation(fields: [clientId], references: [id])
  acknowledgments Json
  signature       String
  signedAt        DateTime @default(now())
}

model InterviewForm {
  id          String   @id @default(cuid())
  clientId    String   @unique
  client      Client   @relation(fields: [clientId], references: [id])
  responses   Json
  submittedAt DateTime @default(now())
}

model AssessmentForm {
  id          String   @id @default(cuid())
  clientId    String   @unique
  client      Client   @relation(fields: [clientId], references: [id])
  responses   Json
  totalScore  Int
  submittedAt DateTime @default(now())
}

model ExitForm {
  id               String   @id @default(cuid())
  clientId         String   @unique
  client           Client   @relation(fields: [clientId], references: [id])
  ratings          Json
  comments         String?
  allowTestimony   Boolean  @default(false)
  submittedAt      DateTime @default(now())
}

model Service {
  id          String  @id @default(cuid())
  name        String
  description String
  audience    String?
  isActive    Boolean @default(true)
}

model Testimony {
  id          String          @id @default(cuid())
  displayName String
  content     String
  rating      Int?
  status      TestimonyStatus @default(PENDING)
  createdAt   DateTime        @default(now())
}

enum TestimonyStatus { PENDING APPROVED REJECTED }

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Admin {
  id           String @id @default(cuid())
  username     String @unique
  passwordHash String
  role         String @default("STAFF")
}
```

Notes:
- Form answers go in `Json` fields because question sets may change. Fixed columns (`totalScore`, `signedAt`, `allowTestimony`) are kept where queries or reports need them.
- One form per client per type is enforced by the `@unique` on `clientId`. Drop this if multiple assessments over time are needed.
- The `referenceCode` (e.g., `LWN-7K2Q9`) ties a client's forms together without requiring a client account.

## 5. Application Structure

```
liwanag/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts                 # services, sample testimonies, admin user
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx          # Home
│  │  │  ├─ about/
│  │  │  ├─ services/
│  │  │  ├─ testimonies/
│  │  │  └─ contact/
│  │  ├─ forms/
│  │  │  ├─ consent/ privacy/ interview/ assessment/ exit/
│  │  │  └─ actions.ts        # Server Actions for submissions
│  │  ├─ admin/               # protected by middleware
│  │  │  ├─ login/
│  │  │  ├─ submissions/
│  │  │  ├─ testimonies/
│  │  │  └─ messages/
│  │  └─ api/                 # route handlers (CSV export, etc.)
│  ├─ components/             # UI + form components
│  ├─ lib/
│  │  ├─ db.ts                # Prisma client singleton
│  │  ├─ auth.ts              # Auth.js config
│  │  ├─ validation/          # Zod schemas (shared client/server)
│  │  └─ services/            # business logic (create client, score assessment)
│  └─ middleware.ts           # guards /admin
├─ tests/
├─ .env.example
└─ README.md
```

## 6. Key Flows

### 6.1 Form submission
1. Visitor completes a form (React Hook Form validates in the browser).
2. Form calls a **Server Action**.
3. The server re-validates with the same **Zod** schema (never trust the client).
4. The service layer creates or finds the `Client`, writes the form row in a transaction, and computes derived values (e.g., assessment score).
5. The user sees a confirmation with their **reference code**.

### 6.2 Form sequence gating
Consent and Privacy must exist for a client before Interview, Assessment, or Exit are accessible. The server checks this on every protected form request, so the check cannot be bypassed from the client.

### 6.3 Testimony moderation
Submission → stored as `PENDING` → admin approves or rejects → the public page queries only `APPROVED` rows.

### 6.4 Admin access
`/admin/*` is guarded by middleware that requires a valid Auth.js session. Passwords are hashed, and login attempts are rate limited.

## 7. Security and Privacy

Mental health data is sensitive, even in a school simulation. Use **dummy data only** and show a visible disclaimer that this is a school activity.

| Concern | Control |
|---|---|
| Transport | HTTPS everywhere; HSTS |
| Injection | Prisma parameterized queries; Zod validation; no raw SQL with user input |
| XSS | React escaping; never use `dangerouslySetInnerHTML` with user content; CSP header |
| CSRF | Server Actions' built-in origin checks; SameSite cookies |
| Authentication | Hashed passwords (argon2/bcrypt); httpOnly, secure session cookies |
| Authorization | Admin-only routes enforced in middleware **and** in each server action |
| Spam / abuse | Honeypot field and rate limiting on public forms |
| Data minimization | Collect only fields the forms need; make contact info optional |
| Secrets | `.env` only, never committed; `.env.example` documents required keys |
| Database access | Least-privilege DB user; no public DB port in production |
| Data privacy law | Data Privacy Form text aligned with the Philippine Data Privacy Act (RA 10173) |
| Backups | Provider-managed snapshots; documented restore step |

## 8. Non-Functional Design

- **Performance:** server-rendered pages, static generation for About and Services where possible, optimized images (`next/image`), and database indexes on `referenceCode`, `Testimony.status`, and `createdAt`.
- **Accessibility:** semantic HTML, Radix primitives, visible focus, WCAG AA contrast, reduced-motion support.
- **Responsiveness:** mobile-first Tailwind breakpoints.
- **Observability:** structured server logs, and hosting-provider error logs. Never log form contents.
- **Testing:** Zod schema and scoring unit tests; Playwright flows for "submit each form" and "admin approves testimony."
- **CI/CD:** GitHub Actions runs lint, type-check, and tests on every PR. Vercel creates preview deployments, and migrations run with `prisma migrate deploy`.

## 9. Alternatives (if the course requires a different stack)

| Stack | Frontend | Backend | Database |
|---|---|---|---|
| **MERN-style** | React (Vite) | Node + Express | PostgreSQL or MySQL via Prisma/Sequelize |
| **LAMP / XAMPP** | HTML, CSS, JS | PHP (or Laravel) | MySQL / MariaDB |
| **Python** | Jinja templates + Tailwind | Flask or Django | PostgreSQL or SQLite |

The data model and flows in sections 4 and 6 carry over unchanged. Only the implementation layer differs.

## 10. Environments and Configuration

| Environment | App | Database |
|---|---|---|
| Local | `npm run dev` | Docker Postgres |
| Preview | Vercel preview per PR | Separate Supabase project (e.g. `liwanag-staging`) |
| Production | Vercel | Supabase Postgres |

Required environment variables:

```
DATABASE_URL=     # Supabase pooled (transaction) connection string, used by the running app
DIRECT_URL=       # Supabase session/direct connection string, used by Prisma migrations
AUTH_SECRET=      # generate with: openssl rand -base64 32
AUTH_URL=         # public site URL, e.g. https://liwanag.vercel.app
```

## 11. Deployment with PostgreSQL

Recommended path: **Supabase (Postgres) + Vercel (app)**. Both have free tiers and need no server management. The app uses Supabase **only as a hosted Postgres database**, accessed through Prisma. It does not use Supabase Auth, Storage, or the client SDK, so there is one data path to secure.

### 11.1 Local development database

```bash
docker run --name liwanag-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=liwanag -p 5432:5432 -d postgres:16
```

`.env` (local):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/liwanag"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/liwanag"
AUTH_SECRET="<generated>"
AUTH_URL="http://localhost:3000"
```

Then:

```bash
npx prisma migrate dev --name init   # create tables, generate client
npx prisma db seed                   # services, sample testimonies, admin user
```

### 11.2 Prisma configuration

The project uses **Prisma 7**, where connection URLs no longer live in `schema.prisma`. Use two URLs: a pooled one for the app (serverless functions open many short connections) and a direct one for the CLI and migrations.

- **CLI (migrate, seed, studio):** `prisma.config.ts` reads `DIRECT_URL` (falling back to `DATABASE_URL`).
- **Running app:** `src/lib/db.ts` builds the client with the `@prisma/adapter-pg` driver adapter and the pooled `DATABASE_URL`.

```ts
// prisma.config.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] },
});
```

The generated client is written to `src/generated/prisma` (git-ignored) and imported from `@/generated/prisma/client`.

`package.json` scripts:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### 11.3 Create the production database (Supabase)

1. Sign up at supabase.com and create a new project. Pick the region closest to your users (e.g. Southeast Asia / Singapore) and set a strong database password. Save it; URL-encode any special characters (`@`, `#`, `/`) when placing it in a connection string.
2. Click **Connect** at the top of the project dashboard and copy two connection strings:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`, with `?pgbouncer=true` appended so Prisma works through the pooler.
   - **Session pooler** (port `5432`, same pooler host) → `DIRECT_URL`, used for migrations.
3. Example shape (replace the placeholders):

```
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

Why the session pooler for `DIRECT_URL`: Supabase's plain direct connection (`db.<project-ref>.supabase.co:5432`) is IPv6-only on the free plan, which many home networks and CI runners can't reach. The session pooler works over IPv4.

### 11.3.1 Lock down the tables (important)

Supabase automatically exposes tables in the `public` schema through its REST API, reachable with the project's public `anon` key. Liwanag stores sensitive form data, so it must not be readable that way. The app connects through Prisma with a direct Postgres role and is not affected by Row Level Security (RLS), so enable RLS on every table **with no policies**. That blocks the REST API entirely while Prisma keeps working.

Add a migration (`npx prisma migrate dev --create-only --name enable_rls`) containing:

```sql
ALTER TABLE "Client"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentForm"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrivacyForm"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InterviewForm"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssessmentForm" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExitForm"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimony"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin"          ENABLE ROW LEVEL SECURITY;
```

Re-run this whenever you add a table. Also never put the `service_role` key or any Supabase key in client code. The app doesn't need them.

After deploying, verify in the Supabase dashboard under **Authentication → Policies** (or the Security Advisor) that every table shows RLS enabled.

### 11.4 Apply migrations to production

Run migrations from your machine (or CI), not on every app boot:

```bash
# point at production temporarily
DATABASE_URL="<pooled>" DIRECT_URL="<direct>" npx prisma migrate deploy
DATABASE_URL="<pooled>" DIRECT_URL="<direct>" npx prisma db seed
```

`migrate deploy` only applies committed migrations from `prisma/migrations/`, so commit those. Never run `migrate dev` or `migrate reset` against production.

Change the seeded admin password immediately, or have the seed script read it from an env variable (`ADMIN_PASSWORD`) so no default password ships.

### 11.5 Deploy the app (Vercel)

1. Push the repo to GitHub.
2. In Vercel, choose **Add New → Project**, then import the repo (framework preset: Next.js).
3. Add the environment variables: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`.
4. Deploy. Vercel runs `npm install` (which triggers `prisma generate`) and then `npm run build`.
5. Set `AUTH_URL` to the final production URL (or custom domain) and redeploy.
6. Open the site and test: submit each form, then confirm the rows appear in the Supabase **Table Editor** or via `npx prisma studio`.

For preview deployments, use a separate Supabase project (`liwanag-staging`) and scope its `DATABASE_URL` / `DIRECT_URL` to the **Preview** environment so PRs never touch production data.

Free-tier note: Supabase pauses free projects after about a week of inactivity. Open the project (or hit the site) before a demo, and restore it from the dashboard if it was paused.

### 11.6 Post-deploy checklist

- [ ] HTTPS works and HTTP redirects to HTTPS
- [ ] Admin login works and `/admin` is blocked when logged out
- [ ] All five forms save to the database
- [ ] Testimonies show only `APPROVED` rows
- [ ] Contact messages appear in the admin dashboard
- [ ] Default admin password changed
- [ ] `.env` is not committed; secrets exist only in Vercel
- [ ] RLS enabled on every table (no policies), confirmed in the Supabase dashboard
- [ ] Supabase backups confirmed for your plan (daily backups on paid plans; take manual `pg_dump` exports on free)
- [ ] Only dummy data is used, and the school-activity disclaimer is visible

### 11.7 Alternative hosting options

| Option | How | Trade-off |
|---|---|---|
| **Railway** or **Render** | Deploy the app and a managed Postgres in one project; set `DATABASE_URL` from the linked database | Simple, but free tiers are limited or sleep |
| **VPS (DigitalOcean, etc.)** | Docker Compose with `app` + `postgres` containers, Caddy or Nginx for HTTPS, run `prisma migrate deploy` on release | Full control, but you handle updates, backups, and security |
| **Neon + Vercel** | Same flow as Supabase, using Neon's pooled and direct connection strings | No dashboard extras; also has database branching for previews |

On a VPS, keep the Postgres port closed to the internet, take scheduled `pg_dump` backups, and store them off the server.

## 12. Implementation Order

1. Scaffold Next.js, Tailwind, shadcn/ui, Prisma, and connect the database.
2. Write the schema, run the first migration, and add the seed script.
3. Build static pages: Home, About, Services, Contact.
4. Build the five forms with shared Zod schemas, Server Actions, and the reference-code flow.
5. Add Testimonies (display, then submission).
6. Add the admin login, submissions view, and testimony moderation.
7. Harden: rate limiting, headers, accessibility pass, and tests.
8. Deploy, write setup instructions in the README, and prepare the demo.

## 13. Open Decisions

1. Does the course mandate a specific stack or database? (If so, use section 9.)
2. Is the site deployed publicly, or demoed locally?
3. Is an admin dashboard required, or is it enough to show records in the database?
4. Can one client submit multiple assessments over time? (This changes the `@unique` constraint.)
