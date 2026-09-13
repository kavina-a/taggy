import type { Prisma } from "../lib/generated/prisma/client";
import { prisma } from "../lib/prisma";
import { businessSeedSchema } from "../lib/validation/business.schema";
import businessesData from "./seed-data/businesses.json" with { type: "json" };

async function main() {
  for (const raw of businessesData as unknown[]) {
    // Throws with a clear path on bad data — this is the only write path in
    // Phase 1, and every record is validated before it ever reaches Postgres
    // (see 01-01-PLAN.md threat T-01-02; 01-02-PLAN.md threat T-02-01 for
    // hours/hoursOverrides row validation).
    const business = businessSeedSchema.parse(raw);
    const attributes = business.attributes as Prisma.InputJsonValue;
    const { hours, hoursOverrides, ...businessFields } = business;

    // upsert (never create()) so re-running the seed while hand-editing the
    // dataset never fails on a duplicate-key error (01-RESEARCH.md Pitfall 4).
    const upserted = await prisma.business.upsert({
      where: { slug: business.slug },
      update: { ...businessFields, attributes },
      create: { ...businessFields, attributes },
    });

    // Delete-then-create the nested hours/hoursOverrides relations so
    // re-running the seed stays idempotent (row count per business stays
    // constant) rather than duplicating rows on every run.
    await prisma.businessHours.deleteMany({
      where: { businessId: upserted.id },
    });
    await prisma.businessHoursOverride.deleteMany({
      where: { businessId: upserted.id },
    });

    if (hours.length > 0) {
      await prisma.businessHours.createMany({
        data: hours.map((h) => ({ ...h, businessId: upserted.id })),
      });
    }
    if (hoursOverrides.length > 0) {
      await prisma.businessHoursOverride.createMany({
        data: hoursOverrides.map((o) => ({
          ...o,
          date: new Date(o.date),
          businessId: upserted.id,
        })),
      });
    }
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
