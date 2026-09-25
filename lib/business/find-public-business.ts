import { prisma } from "@/lib/prisma";

// DATA-03: shared slug-keyed lookup for every public read/write-adjacent
// surface that resolves a business by slug — an isTest:true business
// resolves to null here exactly as if it didn't exist, so callers 404
// identically for a test fixture and a nonexistent slug.
export async function findPublicBusinessId(slug: string): Promise<{ id: string } | null> {
  return prisma.business.findUnique({
    where: { slug, isTest: false },
    select: { id: true },
  });
}
