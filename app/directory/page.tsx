import { prisma } from "@/lib/prisma";
import { BusinessCard } from "@/components/directory/business-card";

export default async function DirectoryPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-12">
      <h1 className="text-[28px] leading-[1.2] font-semibold">
        Colombo Business Directory
      </h1>

      {businesses.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary p-6">
          <h2 className="text-xl leading-[1.2] font-semibold">
            No businesses found
          </h2>
          <p className="text-base leading-normal text-muted-foreground">
            There aren&apos;t any listings in this category yet. Browse all
            businesses instead.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard
              key={business.slug}
              slug={business.slug}
              name={business.name}
              primaryCategory={business.primaryCategories[0] ?? ""}
              district={business.district}
            />
          ))}
        </div>
      )}
    </main>
  );
}
