import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const services = [
  {
    name: "Individual Counseling",
    description: "One-on-one, confidential sessions with a counselor in a safe and unhurried space.",
    audience: "Students and young adults",
  },
  {
    name: "Group Support Sessions",
    description: "Guided small-group conversations where members share experiences and learn from one another.",
    audience: "Anyone seeking community",
  },
  {
    name: "Stress and Anxiety Workshops",
    description: "Practical, hands-on sessions on coping skills, time management, and calming techniques.",
    audience: "Students facing academic pressure",
  },
  {
    name: "Peer Support Circle",
    description: "Trained peer volunteers offer a listening ear and gentle guidance.",
    audience: "Students",
  },
  {
    name: "Mindfulness and Relaxation",
    description: "Breathing, grounding, and guided relaxation sessions to restore calm.",
    audience: "Everyone",
  },
  {
    name: "Academic and Career Counseling",
    description: "Support for school stress, goal setting, and planning your next steps.",
    audience: "Students",
  },
  {
    name: "Crisis Referral and Guidance",
    description: "Immediate guidance and referral to emergency hotlines and partner professionals.",
    audience: "Anyone in distress",
  },
  {
    name: "Psycho-educational Talks",
    description: "Informative talks that reduce stigma and build mental health awareness in schools.",
    audience: "Schools and organizations",
  },
];

const testimonies = [
  {
    displayName: "Anonymous Student",
    content: "I came in overwhelmed and left feeling heard. The team made it easy to take the first step.",
    rating: 5,
  },
  {
    displayName: "Maria",
    content: "The group sessions showed me I was not alone. I look forward to them every week.",
    rating: 5,
  },
  {
    displayName: "J.",
    content: "The mindfulness workshop gave me tools I still use before exams.",
    rating: 4,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
  }

  if ((await prisma.testimony.count()) === 0) {
    await prisma.testimony.createMany({
      data: testimonies.map((t) => ({ ...t, status: "APPROVED" as const })),
    });
  }

  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn("ADMIN_PASSWORD is not set; skipping admin user.");
  } else {
    await prisma.admin.upsert({
      where: { username },
      update: { passwordHash: await bcrypt.hash(password, 12) },
      create: { username, passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
