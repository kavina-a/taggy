// Standalone script used to verify seed idempotency: prints the current
// prisma.business.count() to stdout and exits 0. Run twice around a seed
// re-run (see 01-04-PLAN.md's Task 2 verify command) to prove two
// consecutive seed runs produce an identical row count.
import { prisma } from "../../lib/prisma";

async function main() {
  const count = await prisma.business.count();
  console.log(count);
}

main()
  .catch((e) => {
    console.error("count-businesses failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
