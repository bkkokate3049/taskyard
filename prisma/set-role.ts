import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { withVerifiedSsl } from "../src/lib/database-url";

config({ path: ".env.local" });

const [email, boardTitle, role] = process.argv.slice(2);

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This script is for development only.");
  }
  if (
    !email ||
    !boardTitle ||
    (role !== "OWNER" && role !== "EDITOR" && role !== "VIEWER")
  ) {
    throw new Error(
      'Usage: npm run db:role -- <email> "<board title>" <OWNER|EDITOR|VIEWER>',
    );
  }

  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: withVerifiedSsl(process.env.DATABASE_URL ?? ""),
    }),
  });

  try {
    const result = await db.boardMember.updateMany({
      where: { user: { email }, board: { title: boardTitle } },
      data: { role },
    });
    process.stdout.write(`Updated ${result.count} membership(s)\n`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
