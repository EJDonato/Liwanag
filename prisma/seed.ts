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
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { description: service.description, audience: service.audience },
      create: { name: service.name, description: service.description, audience: service.audience },
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
