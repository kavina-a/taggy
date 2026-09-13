import type { Prisma } from "../lib/generated/prisma/client";
import { prisma } from "../lib/prisma";
import { businessSeedSchema } from "../lib/validation/business.schema";
import businessesData from "./seed-data/businesses.json" with { type: "json" };

async function main() {
  for (const raw of businessesData as unknown[]) {
    // Throws with a clear path on bad data — this is the only write path in
    // Phase 1, and every record is validated before it ever reaches Postgres
    // (see 01-01-PLAN.md threat T-01-02).
    const business = businessSeedSchema.parse(raw);
    const attributes = business.attributes as Prisma.InputJsonValue;

    // upsert (never create()) so re-running the seed while hand-editing the
    // dataset never fails on a duplicate-key error (01-RESEARCH.md Pitfall 4).
    await prisma.business.upsert({
      where: { slug: business.slug },
      update: { ...business, attributes },
      create: { ...business, attributes },
    });
  }

  const count = await prisma.business.count();
  console.log(`Seed complete: ${count} businesses in the database.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
