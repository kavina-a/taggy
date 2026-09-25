import { prisma } from "../lib/prisma";

// T-06-02: one-time DB hygiene for the two known mu3-suffixed Playwright
// fixture families documented in docs/lankareview-full-yelp-clone-prompt.md
// (line 168): "Owner Edit Cafe mu3dnpmg"/"Owner Edit Cafe mu3dndqo" (from
// e2e/leftovers.spec.ts's `Owner Edit Cafe ${stamp}` pattern) and "Do they
// take walk-ins on Sundays mu3cekl1?"/"…mu3cem4a" (from
// e2e/photos-qa-collections.spec.ts's `Do they take walk-ins on Sundays
// ${Date.now().toString(36)}?` pattern). Never imported by prisma/seed.ts —
// this is standalone dev-run hygiene, not an ongoing seed step.
//
// Uses the Prisma Client query builder exclusively (startsWith filters) —
// deliberately never a raw-SQL escape hatch with string interpolation, to
// avoid any injection surface.
const BUSINESS_NAME_PREFIX = "Owner Edit Cafe ";
const QUESTION_TEXT_PREFIX = "Do they take walk-ins on Sundays ";
// Safety guard: only ~2 of each pattern are documented as real fixtures. A
// much higher count signals the pattern is matching something unintended
// and needs human review, not automatic deletion.
const SAFETY_THRESHOLD = 20;

async function main() {
  const [businessCount, questionCount] = await Promise.all([
    prisma.business.count({ where: { name: { startsWith: BUSINESS_NAME_PREFIX } } }),
    prisma.question.count({ where: { text: { startsWith: QUESTION_TEXT_PREFIX } } }),
  ]);

  if (businessCount > SAFETY_THRESHOLD || questionCount > SAFETY_THRESHOLD) {
    throw new Error(
      `Safety guard tripped: found ${businessCount} "${BUSINESS_NAME_PREFIX}"-prefixed businesses ` +
        `and ${questionCount} "${QUESTION_TEXT_PREFIX}"-prefixed questions (threshold ${SAFETY_THRESHOLD}). ` +
        `Aborting without deleting anything — this pattern may be matching unintended rows.`,
    );
  }

  // Cascades to each business's BusinessHours/BusinessHoursOverride/
  // BusinessPhoto/Review/OwnerResponse/Question/CollectionItem rows via the
  // existing onDelete: Cascade relations — no manual child cleanup needed.
  const { count: deletedBusinesses } = await prisma.business.deleteMany({
    where: { name: { startsWith: BUSINESS_NAME_PREFIX } },
  });
  // Cascades to its Answer rows via onDelete: Cascade.
  const { count: deletedQuestions } = await prisma.question.deleteMany({
    where: { text: { startsWith: QUESTION_TEXT_PREFIX } },
  });

  console.log(
    `Cleaned ${deletedBusinesses} "${BUSINESS_NAME_PREFIX}"-prefixed business(es) and ` +
      `${deletedQuestions} "${QUESTION_TEXT_PREFIX}"-prefixed question(s).`,
  );
}

main()
  .catch((e) => {
    console.error("clean-test-fixtures failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
