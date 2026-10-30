# Liwanag — Product Requirements Document

> **Status:** Draft v0.2 (based on README.md)
> **Context:** A school activity project. Liwanag is a website for a (fictional, make-shift) mental health clinic. Items marked **[ASSUMPTION]** are not in the README and need team confirmation.

## 1. Overview

**Product:** Liwanag, a website for a mental health clinic. *Liwanag* is Filipino for "light."

**Purpose:** Present the clinic (tagline, mission/vision, introduction, services), let visitors complete the clinic's forms online, tell them who to contact, and show testimonies. The site must have **its own database** that stores the submitted forms and related content.

**Vision:** A calm, welcoming, trustworthy site that makes seeking mental health support feel safe and simple.

## 2. Goals and Non-Goals

### Goals
1. Cover every content item the README requires (section 4).
2. Provide the five clinic forms as working online forms backed by the site's own database.
3. Protect sensitive information, using a consent and data-privacy flow as the entry point to the other forms.
4. Be calm, accessible, and mobile-friendly.

### Non-Goals (v1)
- Real clinical use, real diagnosis, or real patient data. This is a school simulation. **[ASSUMPTION]**
- Online payments or insurance handling
- Video/telehealth sessions
- Native mobile apps

## 3. Target Users

| Persona | Need |
|---|---|
| Visitor / prospective client | Understand what the clinic offers and feel safe reaching out |
| Client (simulated) | Fill in consent, privacy, interview, assessment, and exit forms without friction |
| Clinic staff / admin **[ASSUMPTION]** | View, search, and export submitted forms; manage testimonies and contacts |
| Instructor / evaluator | See that all README requirements are met and the database works |

## 4. Required Content (from README)

| # | Requirement | Page / Location | Priority |
|---|---|---|---|
| 1 | Tagline of the group | Home hero, header/footer | P0 |
| 2 | Mission / Vision | About page; short version on Home | P0 |
| 3 | Introduction of the institution | About page / Home | P0 |
| 4 | Services offered (creative, imagined make-shift institution) | Services page | P0 |
| 5 | Forms: Consent, Data Privacy, Interview, Assessment, Exit | Forms section | P0 |
| 6 | Who to Contact page | Contact page | P0 |
| 7 | Testimonies / reviews | Testimonies page; highlights on Home | P0 |
| 8 | Own database | Backend (section 7) | P0 |

## 5. Features

### 5.1 Home
Hero with tagline and a primary CTA ("Get Started" → Consent form), mission snippet, services highlights, testimonial carousel/highlights, contact strip.

### 5.2 About
Introduction of the institution, Mission, Vision, and optionally the team/staff. **[ASSUMPTION]**

### 5.3 Services
Creative, make-shift clinic services. Suggested list (team can adjust):
- Individual counseling
- Group support sessions
- Stress and anxiety management workshops
- Peer support circle
- Mindfulness and relaxation sessions
- Crisis referral and hotline guidance
- Academic and career-stress counseling
- Psycho-educational talks for schools

Each service: name, short description, who it's for, how to avail it (links to forms/contact).

### 5.4 Forms
Five forms, each saved to the database. Suggested client journey: **Consent → Data Privacy → Interview → Assessment → Exit**.

| Form | Purpose | Key fields (suggested) |
|---|---|---|
| **Consent Form** | Agreement to receive services | Full name, age/birthdate, guardian name (if minor), checkbox agreements, e-signature (typed name), date |
| **Data Privacy Form** | Acknowledgment of how data is collected, stored, and used | Privacy notice text, acknowledgment checkboxes, name, signature, date |
| **Interview Form** | Intake information | Demographics, reason for seeking help, history, current concerns, support system, preferred contact |
| **Assessment Form** | Screening of the client's current state | Questionnaire with scored scale (e.g., Likert items), notes; total score computed |
| **Exit Form** | Feedback and closure | Satisfaction ratings, progress notes, comments, permission to share as testimony |

Form requirements:
- Required-field validation, clear errors, and a confirmation screen on submit
- Consent and Data Privacy must be completed before the other forms are accessible **[ASSUMPTION]**
- Each submission is linked to a client record via a reference code
- Option to save progress or review before submit (P1)

### 5.5 Who to Contact
Clinic contact details (fictional), office hours, location/map, and a message form. Include an **emergency/crisis notice** with local hotline numbers (e.g., the National Center for Mental Health crisis line in the Philippines; verify numbers before publishing).

### 5.6 Testimonies / Reviews
Display approved testimonies (anonymous or first name only). Visitors or clients can submit a review, which goes into a moderation queue before publishing. Use fictional or consented content only.

### 5.7 Admin Area **[ASSUMPTION]**
Login-protected dashboard to: view and filter form submissions, export to CSV, approve or reject testimonies, and read contact messages.

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | All README content items are present and reachable from the main navigation | P0 |
| FR-2 | Each of the five forms validates input and persists to the database | P0 |
| FR-3 | A confirmation with a reference code is shown after each submission | P0 |
| FR-4 | Testimonies are read from the database and shown on the site | P0 |
| FR-5 | Contact page lists contact details and crisis resources | P0 |
| FR-6 | Contact message form stores messages in the database | P0 |
| FR-7 | Testimony submissions require admin approval before display | P1 |
| FR-8 | Admin login with role-based access to submissions | P1 |
| FR-9 | Export submissions to CSV/PDF | P2 |
| FR-10 | Assessment total score computed automatically | P1 |

## 7. Data Model (Proposed)

The site has its own database. Relational (SQLite or PostgreSQL) fits this data well. **[ASSUMPTION]**

| Table | Key fields |
|---|---|
| `clients` | id, reference_code, full_name, email, phone, birthdate, created_at |
| `consent_forms` | id, client_id, agreements (json), guardian_name, signature, signed_at |
| `privacy_forms` | id, client_id, acknowledgments (json), signature, signed_at |
| `interview_forms` | id, client_id, responses (json), submitted_at |
| `assessment_forms` | id, client_id, responses (json), total_score, submitted_at |
| `exit_forms` | id, client_id, ratings (json), comments, allow_testimony, submitted_at |
| `services` | id, name, description, audience, is_active |
| `testimonies` | id, display_name, content, rating, status (pending/approved/rejected), created_at |
| `contact_messages` | id, name, email, message, created_at, is_read |
| `admins` | id, username, password_hash, role |

## 8. Non-Functional Requirements

- **Privacy and security:** Mental health data is sensitive. Use HTTPS, hash admin passwords, restrict database access, sanitize inputs against injection and XSS, and collect only necessary data. Align with the Philippine Data Privacy Act (RA 10173) in the Data Privacy Form. Use only dummy data during the school activity.
- **Accessibility:** WCAG 2.2 AA; keyboard navigation; high contrast; readable type.
- **Responsive:** Works on phones, tablets, and desktops.
- **Performance:** Pages load in under 3 seconds on typical connections.
- **Tone and UX:** Calm, non-clinical, non-stigmatizing language; no flashing or aggressive animations.
- **Browser support:** Latest Chrome, Edge, Firefox, Safari.

## 9. Design Direction

- **Concept:** "Light": warm, gentle, hopeful.
- **Palette (suggested):** warm off-white background, soft gold or amber accent, calming sage or soft blue secondary, dark neutral text.
- **Typography:** friendly rounded or humanist sans for body; a soft serif or display face for headings.
- **Imagery:** soft illustrations or abstract light motifs; avoid distressing stock imagery.
- **Forms:** one section per step, progress indicator, generous spacing, reassuring microcopy.

## 10. Information Architecture

```
/                 Home (tagline, highlights)
/about            Introduction, Mission, Vision
/services         Services offered
/forms            Forms hub (Consent → Privacy → Interview → Assessment → Exit)
/forms/consent
/forms/privacy
/forms/interview
/forms/assessment
/forms/exit
/testimonies      Testimonies / reviews
/contact          Who to contact + crisis resources
/admin            Dashboard (login required)
```

## 11. Technical Approach (Proposed) **[ASSUMPTION]**

Pick the stack the team already knows. A reasonable default:
- **Frontend:** HTML, CSS, JavaScript (or React/Next.js)
- **Backend:** Node.js with Express (or PHP/Laravel, or Python/Flask)
- **Database:** SQLite for simplicity, or MySQL/PostgreSQL if required by the course
- **Hosting:** local demo, or a free tier (Render, Vercel, Railway)
- **Version control:** Git, with the main branch as the demo branch

## 12. Milestones

| Phase | Deliverables |
|---|---|
| 1. Plan | Finalize tagline, mission/vision, services, form fields, roles |
| 2. Design | Wireframes, palette, typography, page layouts |
| 3. Database | Schema, migrations, seed data |
| 4. Build | Pages, forms wired to database, testimonies, contact |
| 5. Admin | Login, submissions view, testimony moderation |
| 6. QA | Validation, accessibility, responsive, privacy review |
| 7. Present | Demo script, deployment or local run instructions |

## 13. Acceptance Criteria

- [ ] Tagline is visible on the Home page
- [ ] Mission and Vision are displayed
- [ ] Institution introduction is present
- [ ] At least 5–8 creative services are listed
- [ ] All five forms can be filled in and submitted, and each submission appears in the database
- [ ] Who to Contact page exists with crisis resources
- [ ] Testimonies are displayed from the database
- [ ] The site runs with its own database and setup instructions are in the README
- [ ] The site is responsive and readable on mobile

## 14. Risks

| Risk | Mitigation |
|---|---|
| Handling sensitive data, even in a simulation | Use dummy data only; include a clear disclaimer that this is a school activity, not a real clinic |
| Users in real distress may use the site | Show crisis hotline information prominently and include a "this is not a substitute for professional help" notice |
| Scope too large for the timeline | Build in priority order: content pages, then forms and database, then admin |
| Forms feel long or intimidating | Multi-step layout, progress indicator, friendly copy |

## 15. Open Questions

1. What is the group's tagline, and are the mission/vision already written?
2. Which stack and database does the course require or allow?
3. Is an admin dashboard expected, or only storing data in the database?
4. Should the forms be tied to a client account or use reference codes only?
5. Are there official templates for the Consent, Interview, Assessment, and Exit forms from the instructor?
6. Are testimonies real, fictional, or collected from classmates?
7. Is deployment required, or is a local demo enough?
