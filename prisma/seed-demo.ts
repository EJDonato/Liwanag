// Demo data for showing the admin area: clients at every stage, testimonies in every state, and
// messages read and unread. Everyone here is fictional (example.com addresses, made-up names).
//
//   npm run db:seed:demo     add it (safe to run twice: nothing is duplicated)
//   npm run db:unseed:demo   remove exactly what this script added, and nothing else
//
// Kept apart from prisma/seed.ts on purpose: that one is the real seed and runs in production.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { scoreAssessment } from "../src/lib/services/assessment";
import { normalizeReferenceCode } from "../src/lib/services/reference-code";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const now = Date.now();
const ago = ({ days = 0, hours = 0, minutes = 0 }) => new Date(now - ((days * 24 + hours) * 60 + minutes) * 60_000);
const after = (base: Date, minutes: number) => new Date(Math.min(base.getTime() + minutes * 60_000, now));
const born = (age: number, month = 5, day = 14) => new Date(Date.UTC(new Date(now).getUTCFullYear() - age, month, day));

type Stage = 1 | 2 | 3 | 4 | 5;
type DemoClient = {
  code: string;
  name: string;
  age: number;
  email?: string;
  phone?: string;
  guardian?: string;
  startedDaysAgo: number;
  stage: Stage; // how many forms they have finished
  interview?: Record<string, unknown>;
  answers?: number[];
  notes?: string;
  exit?: { ratings: Record<string, unknown>; comments?: string; allowTestimony?: boolean };
};

const clients: DemoClient[] = [
  {
    code: "LWN-7K2Q-9XMA", name: "Maria Clara Reyes", age: 21, email: "maria.reyes@example.com", phone: "0917 555 0101", startedDaysAgo: 12, stage: 5,
    interview: { pronouns: "she/her", yearLevel: "College, 3rd year", reason: "Exams are close and I cannot switch my brain off at night. I would like to learn how to calm down.", concerns: ["Stress about school", "Sleep problems"], history: "no", supportSystem: "My roommate and my older sister.", preferredContact: "email", bestTime: "Weekday afternoons" },
    answers: [0, 1, 0, 1, 1, 0, 1, 1, 0, 0], notes: "I mostly want tips for sleeping.",
    exit: { ratings: { overall: 5, heard: 5, safe: 5, recommend: 5, progressNotes: "I fall asleep faster and I have a routine now." }, comments: "The check-in questions were easier to answer than I expected, and the counselor's follow-up felt personal. I'm glad I started.", allowTestimony: true },
  },
  {
    code: "LWN-4TBC-HE6R", name: "Joshua Dela Cruz", age: 19, email: "joshua.delacruz@example.com", startedDaysAgo: 9, stage: 5,
    interview: { pronouns: "he/him", yearLevel: "College, 1st year", reason: "Everything feels heavy since I moved to the dorm. I have stopped going to some classes.", concerns: ["Low mood or sadness", "Friendships or loneliness", "Sleep problems"], history: "skip", supportSystem: "Not really anyone nearby.", preferredContact: "phone", bestTime: "Evenings, after 6" },
    answers: [2, 2, 2, 1, 2, 2, 2, 2, 1, 2], notes: "I did not know how to answer the last question honestly. I am not okay.",
    exit: { ratings: { overall: 4, heard: 4, safe: 5, recommend: 4, progressNotes: "Talking to someone helped a little." }, comments: "Thank you for reaching out so quickly." },
  },
  {
    code: "LWN-3FDW-5NPG", name: "Angelica Bautista", age: 22, email: "angelica.bautista@example.com", startedDaysAgo: 8, stage: 4,
    interview: { pronouns: "she/her", yearLevel: "College, 4th year or higher", reason: "Thesis stress and constant worrying about what comes after graduation.", concerns: ["Anxiety or constant worry", "Stress about school"], concernsOther: "Money worries", history: "yes", historyDetails: "Saw a school counselor once in first year.", supportSystem: "My boyfriend and two close friends.", preferredContact: "email", bestTime: "Saturdays" },
    answers: [1, 2, 1, 2, 2, 1, 2, 2, 1, 0], notes: "",
  },
  {
    code: "LWN-8RYS-2CKT", name: "Paolo Mendoza", age: 20, email: "paolo.mendoza@example.com", startedDaysAgo: 6, stage: 3,
    interview: { yearLevel: "College, 2nd year", reason: "I get very nervous speaking in class and it is affecting my grades.", concerns: ["Anxiety or constant worry"], history: "no", supportSystem: "My parents, though I have not told them.", preferredContact: "in-person", bestTime: "Between classes, Tuesdays and Thursdays" },
  },
  { code: "LWN-6HQE-4VZA", name: "Kristine Villanueva", age: 18, email: "kristine.villanueva@example.com", startedDaysAgo: 4, stage: 2 },
  { code: "LWN-9MXD-7BJN", name: "Rafael Santiago", age: 23, phone: "0928 555 0166", startedDaysAgo: 2, stage: 1 },
  {
    code: "LWN-2WNK-8SPE", name: "Bea Ramirez", age: 16, guardian: "Lourdes Ramirez", email: "lourdes.ramirez@example.com", startedDaysAgo: 11, stage: 5,
    interview: { pronouns: "she/her", yearLevel: "Grade 11", reason: "I get really anxious before exams and sometimes I cannot eat.", concerns: ["Stress about school", "Anxiety or constant worry"], history: "no", supportSystem: "My mom and my best friend.", preferredContact: "email", bestTime: "After 4pm on weekdays" },
    answers: [1, 1, 2, 1, 2, 2, 1, 2, 1, 0], notes: "",
    exit: { ratings: { overall: 5, heard: 5, safe: 5, recommend: 5, progressNotes: "I can breathe through it now." }, comments: "My mom helped me fill out the forms and the staff were kind to both of us. I felt listened to.", allowTestimony: true },
  },
  {
    code: "LWN-5GAT-3QRH", name: "Carlo Aquino", age: 21, email: "carlo.aquino@example.com", startedDaysAgo: 3, stage: 4,
    interview: { pronouns: "he/him", yearLevel: "College, 3rd year", reason: "I have been feeling flat for months and nothing seems worth the effort.", concerns: ["Low mood or sadness"], history: "no", supportSystem: "My cousin.", preferredContact: "phone", bestTime: "Any weekday morning" },
    answers: [1, 1, 1, 1, 2, 1, 1, 2, 0, 1], notes: "I answered the last one honestly. It comes and goes.",
  },
  {
    code: "LWN-7PCV-6DYM", name: "Samantha Lim", age: 24, email: "samantha.lim@example.com", startedDaysAgo: 14, stage: 5,
    interview: { pronouns: "she/they", yearLevel: "Graduate school", reason: "Burnout from work and school at the same time. I am exhausted all the time.", concerns: ["Stress about school", "Sleep problems", "Family or relationship difficulties"], history: "yes", historyDetails: "A few sessions two years ago, which helped.", supportSystem: "My partner, but they are also stretched thin.", preferredContact: "email", bestTime: "Evenings or weekends" },
    answers: [2, 2, 1, 2, 2, 2, 2, 2, 1, 0], notes: "",
    exit: { ratings: { overall: 5, heard: 5, safe: 5, recommend: 5, progressNotes: "I set limits at work for the first time." }, comments: "Being treated like a person and not a case file made all the difference." },
  },
  {
    code: "LWN-4ZKB-9HTN", name: "Miguel Torres", age: 20, email: "miguel.torres@example.com", startedDaysAgo: 5, stage: 5,
    interview: { pronouns: "he/him", yearLevel: "College, 2nd year", reason: "Trouble focusing and putting things off until the last minute.", concerns: ["Stress about school"], history: "no", supportSystem: "Friends in my org.", preferredContact: "email", bestTime: "Fridays" },
    answers: [0, 1, 1, 1, 1, 1, 1, 2, 0, 0], notes: "",
    exit: { ratings: { overall: 3, heard: 4, safe: 4, recommend: 3, progressNotes: "A bit better." }, comments: "It would help if the forms could be saved and finished later." },
  },
];

const pendingTestimonies = [
  { displayName: "Maria", content: "The check-in questions were easier to answer than I expected, and the counselor's follow-up felt personal. I'm glad I started.", rating: 5, daysAgo: 2 },
  { displayName: "B.", content: "My mom helped me fill out the forms and the staff were kind to both of us. I felt listened to.", rating: 5, daysAgo: 1 },
  { displayName: "Ron", content: "Thank you for the stress workshop. The breathing exercises actually work when I'm panicking before presentations.", rating: 5, daysAgo: 1 },
  { displayName: "Aira", content: "Group sessions helped me realize my classmates feel the same way. I wish there were more sessions per week.", rating: 4, daysAgo: 0 },
];

const rejectedTestimonies = [
  { displayName: "Jerome Villanueva", content: "Call me at 0917-555-0148, my name is Jerome Villanueva from Block 3, I'd love to tell everyone my story!", rating: 5, daysAgo: 6 },
  { displayName: "Promo", content: "Best clinic ever!!! Click here for free followers and cheap deals.", rating: 5, daysAgo: 5 },
];

const messages = [
  { name: "Anna Marie Cruz", email: "annamarie.cruz@example.com", message: "Hello, my daughter is in Grade 11 and has been very anxious about exams. Does the clinic accept minors, and do I need to attend the first session?\n\nThank you.", isRead: false, ago: { hours: 3 } },
  { name: "Mika Tan", email: "mika.tan@example.com", message: "Is it possible to change my interview answers? I submitted the form but forgot to add something important.", isRead: false, ago: { hours: 9 } },
  { name: "Dennis Uy", email: "dennis.uy@example.com", message: "Good day! How do I book an appointment for individual counseling? The forms page says to start with consent, but I'd like to know the available days first.", isRead: false, ago: { days: 1 } },
  { name: "Prof. Ernesto Salazar", email: "e.salazar@example.org", message: "I coordinate student affairs at our college and would like to invite your team to give a psycho-educational talk next semester. Who should I coordinate with?", isRead: false, ago: { days: 4 } },
  { name: "Jocelyn Ramos", email: "jocelyn.ramos@example.com", message: "Just wanted to say thank you to the team for the mindfulness workshop last week. It really helped me before my finals.", isRead: true, ago: { days: 2 } },
  { name: "Bryan Co", email: "bryan.co@example.net", message: "Boost your followers fast!!! Visit our website for the cheapest deals.", isRead: true, ago: { days: 6 } },
  { name: "Leah Gomez", email: "leah.gomez@example.com", message: "Hi, I have been feeling very stressed with school and work, and a friend told me about your group sessions.\n\nCould you tell me how they work, how many people join, and whether I can come just to listen the first time?", isRead: true, ago: { days: 8 } },
];

function validateCodes() {
  for (const c of clients) {
    if (normalizeReferenceCode(c.code) !== c.code) throw new Error(`Demo reference code is not valid: ${c.code}`);
  }
}

async function add() {
  validateCodes();
  const created = { clients: 0, testimonies: 0, messages: 0 };

  for (const c of clients) {
    if (await db.client.findUnique({ where: { referenceCode: c.code }, select: { id: true } })) continue;
    const started = ago({ days: c.startedDaysAgo });
    const signed = after(started, 5);
    const a = c.answers ? scoreAssessment(c.answers) : null;
    await db.client.create({
      data: {
        referenceCode: c.code,
        fullName: c.name,
        email: c.email,
        phone: c.phone,
        birthdate: born(c.age),
        createdAt: started,
        consent: {
          create: {
            agreements: { voluntary: true, confidentiality: true, notEmergency: true },
            guardianName: c.guardian,
            signature: c.name,
            signedAt: signed,
          },
        },
        ...(c.stage >= 2 && { privacy: { create: { acknowledgments: { notice: true, processing: true, rights: true }, signature: c.name, signedAt: after(started, 10) } } }),
        ...(c.stage >= 3 && c.interview && { interview: { create: { responses: JSON.parse(JSON.stringify(c.interview)), submittedAt: after(started, 60) } } }),
        ...(c.stage >= 4 && c.answers && a && {
          assessment: {
            create: {
              totalScore: a.totalScore,
              responses: JSON.parse(JSON.stringify({ answers: c.answers, notes: c.notes || undefined, band: a.band, safetyFlag: a.safetyFlag })),
              submittedAt: after(started, 90),
            },
          },
        }),
        ...(c.stage >= 5 && c.exit && {
          exit: {
            create: {
              ratings: JSON.parse(JSON.stringify(c.exit.ratings)),
              comments: c.exit.comments,
              allowTestimony: !!c.exit.allowTestimony,
              submittedAt: after(started, 60 * 24 * 2),
            },
          },
        }),
      },
    });
    created.clients++;
  }

  const testimonyRows = [
    ...pendingTestimonies.map((t) => ({ ...t, status: "PENDING" as const })),
    ...rejectedTestimonies.map((t) => ({ ...t, status: "REJECTED" as const })),
  ];
  for (const { daysAgo, ...t } of testimonyRows) {
    if (await db.testimony.findFirst({ where: { content: t.content }, select: { id: true } })) continue;
    await db.testimony.create({ data: { ...t, createdAt: ago({ days: daysAgo, hours: 2 }) } });
    created.testimonies++;
  }

  for (const { ago: when, ...m } of messages) {
    if (await db.contactMessage.findFirst({ where: { email: m.email, message: m.message }, select: { id: true } })) continue;
    await db.contactMessage.create({ data: { ...m, createdAt: ago(when) } });
    created.messages++;
  }

  console.log("Added:", created);
}

// Removes only what add() creates, matched by the exact codes, texts and addresses above.
async function remove() {
  const c = await db.client.deleteMany({ where: { referenceCode: { in: clients.map((x) => x.code) } } });
  const t = await db.testimony.deleteMany({ where: { content: { in: [...pendingTestimonies, ...rejectedTestimonies].map((x) => x.content) } } });
  const m = await db.contactMessage.deleteMany({ where: { OR: messages.map((x) => ({ email: x.email, message: x.message })) } });
  console.log("Removed:", { clients: c.count, testimonies: t.count, messages: m.count });
}

(process.argv.includes("--remove") ? remove() : add())
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
