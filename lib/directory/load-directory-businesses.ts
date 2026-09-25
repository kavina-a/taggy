import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type DirectoryBusiness = Prisma.BusinessGetPayload<{
  include: { photos: { orderBy: { sortOrder: "asc" }; take: 1 } };
}>;

interface LoadDirectoryBusinessesResult {
  businesses: DirectoryBusiness[];
  totalCount: number;
}

// DATA-03: an isTest:true business must never appear in the paginated
// /directory listing or inflate its pagination count. Moved verbatim out of
// app/directory/page.tsx with the isTest read-filter added to both Prisma
// calls below.
export async function loadDirectoryBusinesses(
  page: number,
  pageSize: number,
): Promise<LoadDirectoryBusinessesResult> {
  const [businesses, totalCount] = await Promise.all([
    prisma.business.findMany({
      where: { isTest: false },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.business.count({ where: { isTest: false } }),
  ]);

  return { businesses, totalCount };
}
