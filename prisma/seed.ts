import type { Prisma } from "../lib/generated/prisma/client";
import { prisma } from "../lib/prisma";
import { businessSeedSchema, type BusinessSeedInput } from "../lib/validation/business.schema";
import { attributeSchemaByCategory } from "../lib/categories/category-config";
import businessesData from "./seed-data/businesses.json" with { type: "json" };

interface ValidatedRecord {
  business: BusinessSeedInput;
  attributes: Prisma.InputJsonValue;
}

// T-04-01/T-04-03: validate every record (schema + per-category attributes +
// slug uniqueness) in a single pre-write pass, collecting *all* errors before
// any database write happens. A single throw here means zero partial writes —
// the alternative (validating inline during the upsert loop) is exactly the
// non-idempotent, half-seeded-on-failure pattern 01-RESEARCH.md's Pitfall 4
// warns against.
function validateAll(raw: unknown[]): ValidatedRecord[] {
  const errors: string[] = [];
  const seenSlugs = new Set<string>();
  const validated: ValidatedRecord[] = [];

  raw.forEach((entry, index) => {
    const parsed = businessSeedSchema.safeParse(entry);
    if (!parsed.success) {
      const slugHint =
        typeof (entry as { slug?: unknown })?.slug === "string"
          ? (entry as { slug: string }).slug
          : "(missing/invalid slug)";
      errors.push(
        `record[${index}] (slug: ${slugHint}): businessSeedSchema failed: ${parsed.error.message}`,
      );
      return;
    }
    const business = parsed.data;

    // T-04-03: duplicate slugs would silently overwrite the wrong record via
    // upsert — catch it before the transaction opens, not mid-run.
    if (seenSlugs.has(business.slug)) {
      errors.push(`record[${index}]: duplicate slug "${business.slug}" collides with an earlier record`);
      return;
    }
    seenSlugs.add(business.slug);

    const categorySchema = attributeSchemaByCategory[business.primaryCategories[0]];
    if (!categorySchema) {
      errors.push(
        `record[${index}] (slug: ${business.slug}): no attribute schema registered for category "${business.primaryCategories[0]}"`,
      );
      return;
    }
    const attrResult = categorySchema.safeParse(business.attributes);
    if (!attrResult.success) {
      errors.push(
        `record[${index}] (slug: ${business.slug}): attribute validation failed: ${attrResult.error.message}`,
      );
      return;
    }

    validated.push({
      business,
      attributes: attrResult.data as Prisma.InputJsonValue,
    });
  });

  if (errors.length > 0) {
    throw new Error(
      `Seed validation failed with ${errors.length} error(s), zero writes attempted:\n` +
        errors.map((e) => `  - ${e}`).join("\n"),
    );
  }

  return validated;
}

async function main() {
  // Fail fast: parse + validate every record before opening the transaction.
  const records = validateAll(businessesData as unknown[]);

  // T-04-01: wrap every upsert (plus its nested hours/hoursOverrides/photos
  // delete-then-create relations) in a single transaction, so a failure
  // partway through rolls back the *entire* run rather than leaving a
  // half-seeded directory.
  await prisma.$transaction(async (tx) => {
    for (const { business, attributes } of records) {
      const { hours, hoursOverrides, photos, ...businessFields } = business;

      // upsert (never create()) so re-running the seed while hand-editing the
      // dataset never fails on a duplicate-key error (01-RESEARCH.md Pitfall 4).
      const upserted = await tx.business.upsert({
        where: { slug: business.slug },
        update: { ...businessFields, attributes },
        create: { ...businessFields, attributes },
      });

      // Delete-then-create the nested hours/hoursOverrides/photos relations so
      // re-running the seed stays idempotent (row count per business stays
      // constant) rather than duplicating rows on every run.
      await tx.businessHours.deleteMany({
        where: { businessId: upserted.id },
      });
      await tx.businessHoursOverride.deleteMany({
        where: { businessId: upserted.id },
      });
      await tx.businessPhoto.deleteMany({
        where: { businessId: upserted.id },
      });

      if (hours.length > 0) {
        await tx.businessHours.createMany({
          data: hours.map((h) => ({ ...h, businessId: upserted.id })),
        });
      }
      if (hoursOverrides.length > 0) {
        await tx.businessHoursOverride.createMany({
          data: hoursOverrides.map((o) => ({
            ...o,
            date: new Date(o.date),
            businessId: upserted.id,
          })),
        });
      }
      if (photos.length > 0) {
        await tx.businessPhoto.createMany({
          data: photos.map((p) => ({ ...p, businessId: upserted.id })),
        });
      }
    }
  });

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
