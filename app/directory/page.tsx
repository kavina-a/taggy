import Link from "next/link";
import { BusinessCard } from "@/components/directory/business-card";
import { categoryTaxonomy } from "@/lib/categories/category-config";
import { loadDirectoryBusinesses } from "@/lib/directory/load-directory-businesses";

// T-04-02: fixed server-side page size — the client only ever controls the
// page *number* via ?page=, never the page size/limit directly.
const PAGE_SIZE = 24;

interface CategoryInfo {
  groupSlug: string;
  groupLabel: string;
  categoryLabel: string;
}

// leaf category slug -> { groupSlug, groupLabel, categoryLabel }, built once
// per module load from the locked taxonomy (lib/categories/category-config.ts).
const CATEGORY_LOOKUP = new Map<string, CategoryInfo>();
for (const group of categoryTaxonomy) {
  for (const category of group.categories) {
    CATEGORY_LOOKUP.set(category.slug, {
      groupSlug: group.groupSlug,
      groupLabel: group.groupLabel,
      categoryLabel: category.label,
    });
  }
}

// T-04-04: a non-numeric or out-of-range `page` value falls back to page 1
// rather than throwing a raw error to the client.
function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? Number.parseInt(value, 10) : 1;
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

interface DirectoryPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parsePage(resolvedSearchParams.page);

  const { businesses, totalCount } = await loadDirectoryBusinesses(page, PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Group this page's businesses by top-level category group, preserving
  // the name-sorted order within each group.
  const groupOrder: string[] = [];
  const groups = new Map<
    string,
    { groupLabel: string; businesses: typeof businesses }
  >();
  for (const business of businesses) {
    const primarySlug = business.primaryCategories[0];
    const mapped = primarySlug ? CATEGORY_LOOKUP.get(primarySlug) : undefined;
    const groupSlug = mapped?.groupSlug ?? "other";
    const groupLabel = mapped?.groupLabel ?? "Other";
    if (!groups.has(groupSlug)) {
      groups.set(groupSlug, { groupLabel, businesses: [] });
      groupOrder.push(groupSlug);
    }
    groups.get(groupSlug)!.businesses.push(business);
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8 md:py-12">
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
          <Link
            href="/directory"
            className="min-h-11 w-fit text-sm leading-normal font-medium text-brand-accent underline"
          >
            Browse all businesses
          </Link>
        </div>
      ) : (
        <>
          {groupOrder.map((groupSlug) => {
            const group = groups.get(groupSlug)!;
            return (
              <section
                key={groupSlug}
                aria-labelledby={`group-${groupSlug}-heading`}
                className="flex flex-col gap-4"
              >
                <h2
                  id={`group-${groupSlug}-heading`}
                  className="text-xl leading-[1.2] font-semibold"
                >
                  {group.groupLabel}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {group.businesses.map((business) => {
                    const primarySlug = business.primaryCategories[0] ?? "";
                    const categoryLabel =
                      CATEGORY_LOOKUP.get(primarySlug)?.categoryLabel ?? primarySlug;
                    return (
                      <BusinessCard
                        key={business.slug}
                        slug={business.slug}
                        name={business.name}
                        primaryCategory={primarySlug}
                        categoryLabel={categoryLabel}
                        district={business.district}
                        photoUrl={business.photos[0]?.url ?? null}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          <nav
            aria-label="Directory pagination"
            className="flex items-center justify-between gap-4 border-t pt-6"
          >
            {page > 1 ? (
              <Link
                href={`/directory?page=${page - 1}`}
                className="flex min-h-11 items-center rounded-md px-4 text-sm leading-normal font-medium underline"
              >
                Previous
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="text-sm leading-normal text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/directory?page=${page + 1}`}
                className="flex min-h-11 items-center rounded-md px-4 text-sm leading-normal font-medium underline"
              >
                Next
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        </>
      )}
    </main>
  );
}
