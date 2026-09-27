import React from "react";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export async function CuratedCollectionsSection() {
  const collections = await prisma.collection.findMany({
    where: { isPublic: true },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 3,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              district: true,
              photos: {
                take: 1,
                orderBy: { sortOrder: "asc" },
                select: { url: true },
              },
            },
          },
        },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  if (collections.length === 0) return null;

  return (
    <section className="flex flex-col gap-6 w-full" aria-label="Curated Collections">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Curated Collections
          </h2>
          <p className="text-sm text-neutral-500">
            Handcrafted guides to Colombo&apos;s finest dining, stays, and essential services
          </p>
        </div>
        <Link
          href="/collections"
          className="text-sm font-bold text-[#D71616] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View All Collections</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((col) => {
          const itemCount = col._count.items;
          const bgPhoto =
            col.items[0]?.business.photos[0]?.url ||
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";

          return (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Photo Area */}
              <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${bgPhoto})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Bookmark Pill */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                  <Bookmark className="size-3 fill-white text-white" />
                  <span>{itemCount} {itemCount === 1 ? "place" : "places"}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold leading-snug drop-shadow-sm group-hover:text-red-200 transition-colors line-clamp-2">
                    {col.name}
                  </h3>
                </div>
              </div>

              {/* Business Snippet */}
              <CardContent className="p-4 flex flex-col justify-between flex-1 gap-2.5">
                <ul className="flex flex-col gap-1 text-xs text-neutral-600">
                  {col.items.slice(0, 2).map((item) => (
                    <li key={item.business.id} className="flex items-center gap-1.5 truncate">
                      <span className="size-1 rounded-full bg-[#D71616] shrink-0" />
                      <span className="font-semibold text-neutral-900 truncate">
                        {item.business.name}
                      </span>
                    </li>
                  ))}
                  {itemCount > 2 && (
                    <li className="text-[11px] text-neutral-400 pl-2.5">
                      + {itemCount - 2} more spots
                    </li>
                  )}
                </ul>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D71616] group-hover:underline pt-1">
                  <span>Explore List</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CuratedCollectionsSection;
