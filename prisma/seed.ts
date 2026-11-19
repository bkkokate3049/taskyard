import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await db.board.deleteMany({ where: { title: "Website launch" } });
  await db.user.deleteMany({
    where: { email: { in: ["asha@example.com", "ravi@example.com"] } },
  });

  const asha = await db.user.create({
    data: { email: "asha@example.com", name: "Asha" },
  });
  const ravi = await db.user.create({
    data: { email: "ravi@example.com", name: "Ravi" },
  });
  const owner = process.env.SEED_OWNER_EMAIL
    ? await db.user.findUnique({ where: { email: process.env.SEED_OWNER_EMAIL } })
    : null;

  await db.board.create({
    data: {
      title: "Website launch",
      members: {
        create: [
          { userId: asha.id, role: "OWNER" },
          { userId: ravi.id, role: "EDITOR" },
          ...(owner ? [{ userId: owner.id, role: "OWNER" as const }] : []),
        ],
      },
      columns: {
        create: [
          {
            title: "To do",
            position: 1000,
            cards: {
              create: [
                { title: "Design homepage", position: 1000, assigneeId: asha.id },
                { title: "Write copy", position: 2000, assigneeId: ravi.id },
              ],
            },
          },
          {
            title: "Doing",
            position: 2000,
            cards: {
              create: [{ title: "Set up hosting", position: 1000, assigneeId: asha.id }],
            },
          },
          { title: "Done", position: 3000 },
        ],
      },
    },
  });

  process.stdout.write("Seeded sample data\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
