import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bookmark, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryLabel } from "@/lib/categories/category-config";

export const metadata = {
  title: "Curated Collections in Sri Lanka | LankaReview",
  description: "Explore handcrafted collections of top restaurants, luxury stays, artisan cafes, and local services in Sri Lanka.",
};

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          city: true,
          avatarUrl: true,
        },
      },
      items: {
        take: 3,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              district: true,
              primaryCategories: true,
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

  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-10 md:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Header Banner */}
        <header className="flex flex-col gap-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <Bookmark className="size-3.5 fill-[#D71616]" />
            <span>Curated Guides & Lists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            Collections in Sri Lanka
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Handcrafted guides to Colombo&apos;s finest dining, scenic rooftop escapes, artisan cafes, and trusted local pros—curated by our community and editors.
          </p>
        </header>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => {
            const itemCount = col._count.items;
            const primaryThumb =
              col.items[0]?.business.photos[0]?.url ||
              "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";

            return (
              <Card
                key={col.id}
                className="group overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col"
              >
                {/* Hero Thumbnail Preview */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-900">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${primaryThumb})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Bookmark Badge */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                    <Bookmark className="size-3.5 fill-white text-white" />
                    <span>{itemCount} {itemCount === 1 ? "place" : "places"}</span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <h2 className="text-lg font-bold leading-snug drop-shadow-sm group-hover:text-red-300 transition-colors line-clamp-1">
                      {col.name}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                <CardContent className="p-5 flex flex-col flex-1 justify-between gap-4">
                  {/* Included Businesses Mini-List */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Featured in this guide:
                    </span>
                    <ul className="flex flex-col gap-1.5 text-sm text-neutral-700">
                      {col.items.map((item) => (
                        <li key={item.business.id} className="flex items-center gap-2 truncate">
                          <span className="size-1.5 rounded-full bg-[#D71616]" />
                          <span className="font-semibold text-neutral-900 truncate">
                            {item.business.name}
                          </span>
                          <span className="text-xs text-neutral-400 shrink-0">
                            ({item.business.district})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Curator Info & Action */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 border border-neutral-200">
                        {col.user.avatarUrl && (
                          <AvatarImage src={col.user.avatarUrl} alt={col.user.name ?? "Curator"} />
                        )}
                        <AvatarFallback className="text-[10px] font-bold bg-neutral-100">
                          {col.user.name ? col.user.name[0] : "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-xs leading-tight">
                        <span className="font-semibold text-neutral-800">
                          {col.user.name ?? "LankaReview"}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {col.user.city ?? "Colombo"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/collections/${col.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#D71616] group-hover:underline"
                    >
                      <span>Explore</span>
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
