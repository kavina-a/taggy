import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  ShoppingBag,
  Wine,
  Flame,
  Flower2,
  Car,
  Wrench,
  Grid,
} from "lucide-react";

interface YelpCategoryTile {
  title: string;
  href: string;
  icon: React.ElementType;
  countHint?: string;
}

const YELP_MAIN_CATEGORIES: YelpCategoryTile[] = [
  {
    title: "Restaurants",
    href: "/search?category=restaurant",
    icon: UtensilsCrossed,
    countHint: "Dining, Cafes, Bakeries",
  },
  {
    title: "Shopping",
    href: "/search?category=retail-shopping",
    icon: ShoppingBag,
    countHint: "Clothing, Electronics, Markets",
  },
  {
    title: "Nightlife",
    href: "/search?category=nightlife-bars",
    icon: Wine,
    countHint: "Pubs, Bars, Rooftop Lounges",
  },
  {
    title: "Active Life",
    href: "/search?category=fitness-recreation",
    icon: Flame,
    countHint: "Gyms, Yoga, Sports, Pools",
  },
  {
    title: "Beauty & Spas",
    href: "/search?category=beauty-spa",
    icon: Flower2,
    countHint: "Salons, Ayurveda, Hair, Nails",
  },
  {
    title: "Automotive",
    href: "/search?category=auto-repair",
    icon: Car,
    countHint: "Mechanics, Three-Wheelers, Tyres",
  },
  {
    title: "Home Services",
    href: "/search?category=home-services",
    icon: Wrench,
    countHint: "AC Repair, Plumbers, Electricians",
  },
  {
    title: "More Categories",
    href: "/directory",
    icon: Grid,
    countHint: "Tuition, Weddings, Legal, Medical",
  },
];

export function YelpCategories({ heading = "Categories" }: { heading?: string }) {
  return (
    <section className="flex flex-col gap-6 w-full" aria-label="Browse categories">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          {heading}
        </h2>
        <Link
          href="/directory"
          className="text-sm font-semibold text-[#007692] hover:underline"
        >
          View All Categories
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {YELP_MAIN_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-neutral-200/90 bg-white p-6 text-center transition-all hover:border-[#D71616]/40 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-neutral-50 text-neutral-700 transition-colors group-hover:bg-[#FFE9E9] group-hover:text-[#D71616]">
                <Icon className="size-7 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-neutral-900 group-hover:text-[#D71616] transition-colors">
                  {cat.title}
                </span>
                {cat.countHint && (
                  <span className="text-xs text-neutral-500 font-normal line-clamp-1">
                    {cat.countHint}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default YelpCategories;
