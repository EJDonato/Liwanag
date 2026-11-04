import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { services } from "../src/lib/site";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

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
  {
    displayName: "Ana",
    content: "Nobody rushed me, and nobody made me feel like I was too much.",
    rating: 5,
  },
  {
    displayName: "Joy",
    content: "Filling in the exit form made me realize how far I had come.",
    rating: 5,
  },
  {
    displayName: "K.",
    content: "The Thursday peer circle is the one hour of my week I protect, no matter what.",
    rating: 5,
  },
  {
    displayName: "Anonymous",
    content: "The hotline numbers were right there when I needed them at 2 a.m. That alone mattered.",
    rating: 5,
  },
  {
    displayName: "Rica",
    content: "I brought my younger sister here. She was nervous at the door and smiling when she left.",
    rating: 5,
  },
  {
    displayName: "Paolo",
    content:
      "I almost did not fill out the forms because I thought it would feel like a test. It did not. Everything was gentle, and I knew I could stop whenever I needed to.",
    rating: 5,
  },
  {
    displayName: "Dani",
    content: "Being treated like a person and not a case file. That is what I will remember.",
    rating: 5,
  },
  {
    displayName: "Anonymous Student",
    content:
      "I liked that I could do everything online first. By the time I walked into the wellness room, I already felt a little less scared.",
    rating: 4,
  },
  // Newest last: it leads the Testimonies page, so it is the longest and warmest one.
  {
    displayName: "Miguel R.",
    content:
      "My counselor helped me break my thesis stress into pieces I could actually handle. I am sleeping better now than I have in a year, and I did not think I would say that.",
    rating: 5,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { description: service.description, audience: service.audience },
      create: { name: service.name, description: service.description, audience: service.audience },
    });
  }

  // One at a time and only when missing, so re-seeding never duplicates and the list order is the
  // creation order (the Testimonies page leads with the newest).
  for (const t of testimonies) {
    const exists = await prisma.testimony.findFirst({ where: { content: t.content }, select: { id: true } });
    if (!exists) await prisma.testimony.create({ data: { ...t, status: "APPROVED" } });
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
