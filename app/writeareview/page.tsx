import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Star, Search, ArrowRight, ShieldCheck, PenTool } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/search/search-bar";
import { getCategoryLabel } from "@/lib/categories/category-config";

export const metadata = {
  title: "Write a Review | LankaReview",
  description: "Share your experience and help locals find great businesses across Sri Lanka. Rate restaurants, auto mechanics, home pros, and more.",
};

export default async function WriteAReviewPage() {
  const businesses = await prisma.business.findMany({
    take: 8,
    orderBy: { reviewCount: "desc" },
    include: {
      photos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-[#D71616] border border-red-200">
            <PenTool className="size-3.5" />
            <span>Community Voice</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 text-balance">
            Find a business to review
          </h1>

          <p className="text-base text-neutral-600 max-w-lg">
            Review anything from your favorite seafood restaurant and artisan cafe to your trusted roadside tuk mechanic.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-xl pt-2">
            <SearchBar variant="unified" />
          </div>
        </div>

        {/* Popular Places to Review */}
        <section className="flex flex-col gap-6 pt-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                Visited one of these places recently?
              </h2>
              <p className="text-xs text-neutral-500">
                Tap the stars to start your review instantly
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-bold text-[#D71616] hover:underline flex items-center gap-1"
            >
              <span>Browse All</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {businesses.map((biz) => {
              const photo =
                biz.photos[0]?.url ||
                "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80";
              const cat = getCategoryLabel(biz.primaryCategories[0]) ?? biz.primaryCategories[0];

              return (
                <Card
                  key={biz.id}
                  className="group overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-neutral-100">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${photo})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-white/90">
                      {biz.district} &middot; {cat}
                    </span>
                  </div>

                  <CardContent className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#D71616] transition-colors line-clamp-1">
                      {biz.name}
                    </h3>

                    {/* Interactive 5-Star Row */}
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-100">
                      <span className="text-[11px] font-semibold text-neutral-500">
                        Select your rating:
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Link
                            key={star}
                            href={`/business/${biz.slug}#write-a-review`}
                            className="flex size-7 items-center justify-center rounded-sm bg-neutral-100 hover:bg-[#D71616] text-neutral-400 hover:text-white transition-all shadow-2xs hover:scale-110"
                            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star className="size-4 fill-current" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
