import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "OTR Debeader", displayOrder: 1 },
  { name: "Punch Cutter II", displayOrder: 2 },
  { name: "Titan II", displayOrder: 3 },
  { name: "Interchangeable Parts", displayOrder: 4 }
];

const parts = [
  { name: "Hydraulic Filter", partType: "hydraulic", defaultQty: 2, defaultPrice: 181.4, category: "OTR Debeader" },
  { name: "Limit Switch", partType: "electronic", defaultQty: 2, defaultPrice: 505.23, category: "OTR Debeader" },
  { name: "Cutter Blade", partType: "blade", defaultQty: 2, defaultPrice: 607.23, category: "OTR Debeader" },
  { name: "Guide Roller & Bushing", partType: "mechanical", defaultQty: 1, defaultPrice: 165.49, category: "OTR Debeader" },
  { name: "Guide Roller Pin", partType: "mechanical", defaultQty: 1, defaultPrice: 88.58, category: "OTR Debeader" },
  { name: "Hydraulic Filter", partType: "hydraulic", defaultQty: 2, defaultPrice: 181.4, category: "Punch Cutter II" },
  { name: "Sensory Rotary Encoder", partType: "electronic", defaultQty: 1, defaultPrice: 735.65, category: "Punch Cutter II" },
  { name: "Limit Switch", partType: "electronic", defaultQty: 2, defaultPrice: 505.23, category: "Punch Cutter II" },
  { name: "Punch Blade", partType: "blade", defaultQty: 2, defaultPrice: 596.53, category: "Punch Cutter II" },
  { name: "Hydraulic Filter", partType: "hydraulic", defaultQty: 2, defaultPrice: 181.4, category: "Titan II" },
  { name: "Cutter Blade", partType: "blade", defaultQty: 2, defaultPrice: 2653.0, category: "Titan II" },
  { name: "Guide Roller & Bushing", partType: "mechanical", defaultQty: 1, defaultPrice: 831.4, category: "Titan II" },
  { name: "Guide Roller Pin", partType: "mechanical", defaultQty: 1, defaultPrice: 588.4, category: "Titan II" },
  { name: "PQ Control", partType: "electronic", defaultQty: 1, defaultPrice: 655.9, category: "Interchangeable Parts" }
];

async function main() {
  console.log("Seeding database...");

  // Create test user
  const hashedPassword = await bcrypt.hash("johndoe123", 10);
  const existingUser = await prisma.user.findUnique({ where: { email: "john@doe.com" } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: "john@doe.com",
        name: "John Doe",
        password: hashedPassword
      }
    });
    console.log("Test user created");
  }

  // Create categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { displayOrder: cat.displayOrder },
      create: cat
    });
  }
  console.log("Categories seeded");

  // Create parts
  for (const part of parts) {
    const category = await prisma.category.findUnique({ where: { name: part.category } });
    if (category) {
      const existingPart = await prisma.part.findFirst({
        where: { name: part.name, categoryId: category.id }
      });
      if (!existingPart) {
        await prisma.part.create({
          data: {
            name: part.name,
            partType: part.partType,
            defaultQty: part.defaultQty,
            defaultPrice: part.defaultPrice,
            categoryId: category.id
          }
        });
      }
    }
  }
  console.log("Parts seeded");
  console.log("Database seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
