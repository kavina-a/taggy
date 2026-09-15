import Link from "next/link";
import {
  UtensilsCrossed,
  ShoppingBag,
  Wrench,
  Sparkles,
  GraduationCap,
  PartyPopper,
  Scissors,
  Briefcase,
  BedDouble,
  type LucideIcon,
} from "lucide-react";
import { categoryTaxonomy } from "@/lib/categories/category-config";

// One generic icon per taxonomy group (02-07-PLAN.md Task 2: "a single
// generic category icon per group is acceptable if no per-leaf icon mapping
// exists yet" — none does). `Briefcase` is also the fallback for any future
// group slug added to category-config.ts without a corresponding entry here.
const GROUP_ICON: Record<string, LucideIcon> = {
  "food-dining": UtensilsCrossed,
  "shopping-retail": ShoppingBag,
  "home-local-services": Wrench,
  "beauty-wellness": Sparkles,
  education: GraduationCap,
  "events-weddings": PartyPopper,
  "fashion-tailoring": Scissors,
  "professional-services": Briefcase,
  "travel-lodging": BedDouble,
};

// CategoryShortcuts — grid (never a horizontal scroll rail, per 02-UI-SPEC.md
// "Home / discovery page") of taxonomy-driven tiles, one per leaf category.
// Never hides: categoryTaxonomy is always non-empty static data.
export function CategoryShortcuts() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl leading-[1.2] font-semibold">Browse by Category</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categoryTaxonomy.flatMap((group) => {
          const Icon = GROUP_ICON[group.groupSlug] ?? Briefcase;
          return group.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/search?category=${category.slug}`}
              className="flex min-h-11 flex-col items-center justify-center gap-2 rounded-lg bg-secondary p-4 text-center outline-none transition-colors hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-6 w-6 text-foreground" aria-hidden="true" />
              <span className="text-sm leading-normal text-foreground">
                {category.label}
              </span>
            </Link>
          ));
        })}
      </div>
    </section>
  );
}

export default CategoryShortcuts;
