import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BusinessCard } from "@/components/directory/business-card";
import { getCategoryLabel } from "@/lib/categories/category-config";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const session = await getSession();

  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true } },
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          business: {
            include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
          },
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  const isOwner = session.userId === collection.userId;
  if (!collection.isPublic && !isOwner) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-[1.2] font-semibold">{collection.name}</h1>
        <p className="text-base text-muted-foreground">
          {collection.isPublic ? "Public list" : "Private list (only you can see this)"}
          {collection.user.name ? ` · ${collection.user.name}` : ""}
        </p>
      </header>
      {collection.items.length === 0 ? (
        <p className="text-base text-muted-foreground">This list is empty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {collection.items.map((item) => {
            const primary = item.business.primaryCategories[0] ?? "";
            return (
              <BusinessCard
                key={item.business.id}
                slug={item.business.slug}
                name={item.business.name}
                primaryCategory={primary}
                categoryLabel={getCategoryLabel(primary) ?? primary}
                district={item.business.district}
                photoUrl={item.business.photos[0]?.url ?? null}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
