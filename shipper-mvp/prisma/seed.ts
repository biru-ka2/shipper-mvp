import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Optional: create a test user for development
  // await prisma.user.upsert({
  //   where: { email: "test@example.com" },
  //   update: {},
  //   create: {
  //     email: "test@example.com",
  //     name: "Test User",
  //     picture: null,
  //   },
  // });
  console.log("Seed completed (no data added by default).");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
