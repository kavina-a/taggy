import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCollection } from "@/lib/collections/ensure-default";
import { CollectionCard } from "@/components/collections/collection-card";

export default async function SavedPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  await ensureDefaultCollection(session.userId);
  const collections = await prisma.collection.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <h1 className="text-[28px] leading-[1.2] font-semibold">Saved places</h1>
      <p className="text-base text-muted-foreground">
        Your default list is My Saved Places. Make any list public to get a shareable link.
      </p>
      {collections.length === 0 ? (
        <p className="text-base text-muted-foreground">
          You haven&apos;t saved anything yet.{" "}
          <Link href="/directory" className="underline">
            Browse the directory
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={{
                id: collection.id,
                name: collection.name,
                slug: collection.slug,
                isDefault: collection.isDefault,
                isPublic: collection.isPublic,
                itemCount: collection._count.items,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
