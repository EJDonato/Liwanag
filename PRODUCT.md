# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: students and young adults deciding whether to reach out for mental health support. They are often anxious or unsure, usually on a phone, and need privacy and no judgment. Their job on arrival is to understand what the clinic offers, feel safe enough to take a first step, and complete the clinic's intake and feedback forms.

Secondary audiences (parents or guardians, the general public, clinic staff) are not confirmed as design drivers. Staff matter operationally: the planned admin area is for reviewing submissions and moderating testimonies.

## Product Purpose

Liwanag ("light" in Filipino) is the website of a mental health clinic. It presents the clinic (tagline, mission and vision, introduction, services), lets visitors complete the five clinic forms online, tells them who to contact, and shows testimonies. It keeps its own database of submitted forms and related content.

Success is a visitor who reaches out and finishes the form journey without friction or fear, and a person in distress who finds the crisis hotlines immediately.

## Positioning

- Stigma-free, school-based care: asking for help made as ordinary as asking for help with homework.
- Peer support circles alongside professional counselors.
- Private online intake with no account: five guided forms done at the visitor's own pace, linked by a reference code rather than a login.

## Operating Context

- The client journey is Consent, Data Privacy, Interview, Assessment, Exit, in that order. Consent and Data Privacy must be on file before the later forms open, and Exit requires all four earlier forms.
- A visitor's reference code (`LWN-XXXX-XXXX`) is how they continue across sessions and devices. It does not expose submitted answers.
- Built as a school project. Visitor-facing surfaces must never say so.

## Capabilities and Constraints

- Built: Home, About, Services, Contact, and a forms hub with all five forms saved to a PostgreSQL database (Supabase in production, via Prisma 7). Next.js App Router with TypeScript, Tailwind and shadcn/ui.
- Not yet built: testimonies page, contact message form, admin area with login, CSV export, rate limiting, and end-to-end tests.
- The assessment is a short self-report check-in scored 0-30 on the server. It is a conversation starter, not a diagnosis. Any non-zero answer to the safety question surfaces hotlines immediately.
- Testimonies shown publicly must be approved by staff first; the Exit form can add a pending one with the visitor's permission.
- Undecided: whether guardians are an audience of their own, whether a visitor may submit multiple assessments over time, and the final tagline, mission and vision.

## Brand Commitments

- Presented as a real clinic. No visible mention of a school activity, simulation, dummy data or fictional status anywhere a visitor can see.
- Philippine context: local crisis hotlines, a Filipino-language name, and privacy wording aligned with the Data Privacy Act (RA 10173).
- Calm, non-clinical tone: plain, warm, non-stigmatizing language, with no alarmist or diagnostic framing.
- Logo assets in `public/` (`logo-full.png`, `logo-mark.png`, `Liwanag Wellness Logo.png`).

## Evidence on Hand

- The logo set and the hero image `public/hero-waves.png`.
- Three seeded sample testimonies and eight service descriptions in `prisma/seed.ts` and `src/lib/site.ts`. Their wording is drafted, not collected from real clients.
- Not on hand, and not to be fabricated: real client testimonials, verified contact details (the email, phone and address are placeholders), verified hotline numbers (flagged to verify against official sources before publishing), and a finalized tagline, mission and vision.

## Product Principles

1. Safety first: a person in distress must see crisis help without searching, on every page that matters.
2. Reaching out must feel safe, simple and kind: no accounts, no pressure, one small step at a time.
3. Protect sensitive information: collect only what the forms need, say plainly how it is used, and never log or expose form contents.
4. Honest guidance, not diagnosis: results and notices describe next steps and never label the visitor.
5. Trustworthy as a real clinic: no placeholder or simulation cues, and no claims the site cannot back up.

## Accessibility & Inclusion

WCAG 2.2 AA is the target. The site must work well on phones, with full keyboard navigation, visible focus, high contrast, readable type, and calm motion that respects reduced-motion settings. No flashing or aggressive animation.
