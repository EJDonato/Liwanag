# Liwanag

Our goal is to create a website for a mental health clinic for a school activity

It needs to have its own database



**Guidelines for website: here are to include on the website**

Tag line of the group 

Mission/Vision

Intro of the institution

Services offered (you may get creative, envision a make shift mental health institution)

Forms to fill in (Consent, Data privacy, Interview Form, Assessment Form, and Exit Form)

Who to Contact Page 

TEstimonies/reviews

---

## Docs

- [PRD.md](./PRD.md): product requirements
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md): architecture, stack, database, deployment

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma 7 · PostgreSQL (Supabase in production)

## Getting started

Requires Node 20+ and Docker.

```bash
npm install
cp .env.example .env          # then set AUTH_SECRET and ADMIN_PASSWORD
docker compose up -d          # local Postgres on :5432
npx prisma migrate dev        # apply migrations
npm run db:seed               # services, sample testimonies, admin user
npm run dev                   # http://localhost:3000
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply committed migrations (production) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Browse data in Prisma Studio |

## Admin area

Staff sign in at `/admin` (there is no link to it on the public site; bookmark it). It signs you in with the `ADMIN_USERNAME` and `ADMIN_PASSWORD` you set before running `npm run db:seed`. Re-run the seed to change the password.

What staff can do once signed in:

- **Dashboard:** what needs attention first (check-ins with a safety answer, testimonies waiting, unread messages).
- **Testimonies:** approve, decline, take down or edit what visitors send. Nothing is public until approved.
- **Submissions:** search clients by name or reference code, filter to safety-flagged check-ins, open a client to see all five forms, and download a CSV (it honours the search and filter).
- **Messages:** read what came through the Contact page, mark read or unread, reply by email, delete.

Session and sign-in details:

- Sessions last 8 hours and live in an `httpOnly` cookie scoped to `/admin`.
- Five wrong passwords in a row lock the account for 15 minutes.
- Every admin page re-checks the session against the database (`src/lib/admin/dal.ts`); `src/proxy.ts` is only a quick redirect.
- `AUTH_SECRET` must be a random value of 32 or more characters. Without it nobody can sign in.

Sessions use a signed cookie built with `jose`, following the Next.js authentication guide, instead of the Auth.js package named in SYSTEM_DESIGN.md. `next-auth` is still installed but unused.

## Deployment

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) section 11 (Supabase + Vercel).

> This is a school activity. Use dummy data only.
