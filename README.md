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

## Deployment

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) section 11 (Supabase + Vercel).

> This is a school activity. Use dummy data only.
