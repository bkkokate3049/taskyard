import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { withVerifiedSsl } from "../src/lib/database-url";

config({ path: ".env.local" });

const COLUMNS = 5;
const CARDS_PER_COLUMN = 40;
const email = process.argv[2];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This script is for development only.");
  }
  if (!email) {
    throw new Error("Usage: npm run db:seed:perf -- <your email>");
  }

  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: withVerifiedSsl(process.env.DATABASE_URL ?? ""),
    }),
  });

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new Error("No user with that email. Sign in once first.");

    await db.board.deleteMany({
      where: { title: "Performance test", members: { some: { userId: user.id } } },
    });

    await db.board.create({
      data: {
        title: "Performance test",
        members: { create: { userId: user.id, role: "OWNER" } },
        columns: {
          create: Array.from({ length: COLUMNS }, (_, c) => ({
            title: `Column ${c + 1}`,
            position: (c + 1) * 1000,
            cards: {
              create: Array.from({ length: CARDS_PER_COLUMN }, (_, k) => ({
                title: `Task ${c + 1}.${k + 1}`,
                position: (k + 1) * 1000,
              })),
            },
          })),
        },
      },
    });

    process.stdout.write("Created the Performance test board (200 cards)\n");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
