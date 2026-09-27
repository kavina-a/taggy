"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  Wrench,
  Car,
  Flower2,
  Compass,
  MoreHorizontal,
  ChevronDown,
  ArrowRight,
  ShoppingBag,
  Flame,
  Coffee,
  Wine,
  Utensils,
  ChefHat,
  Fish,
  Soup,
  Pizza,
  Beer,
  Wind,
  Zap,
  Droplets,
  Hammer,
  Tv,
  Paintbrush,
  Home,
  Key,
  Brush,
  Trees,
  ShieldAlert,
  Truck,
  Cpu,
  CircleDot,
  Droplet,
  Waves,
  Cog,
  BatteryCharging,
  Leaf,
  HeartHandshake,
  Scissors,
  Crown,
  Hand,
  Activity,
  Dumbbell,
  BedDouble,
  Landmark,
  PartyPopper,
  MapPin,
  Camera,
  GraduationCap,
  ShoppingBasket,
  Scale,
  Calculator,
  Building,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MegaSubItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface MegaColumn {
  heading?: string;
  items: MegaSubItem[];
}

interface MegaCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  columns: MegaColumn[];
  featuredLink?: {
    label: string;
    href: string;
  };
}

export const MEGA_CATEGORIES: MegaCategory[] = [
  {
    id: "restaurants",
    label: "Restaurants",
    icon: UtensilsCrossed,
    href: "/search?category=restaurant",
    featuredLink: {
      label: "Explore all Colombo Restaurants",
      href: "/search?category=restaurant",
    },
    columns: [
      {
        heading: "Dining & Orders",
        items: [
          { label: "Takeout & Delivery", href: "/search?find_desc=Takeout", icon: ShoppingBag },
          { label: "Hot & New", href: "/search?find_desc=Hot+New+Restaurants", icon: Flame },
          { label: "Breakfast & Brunch", href: "/search?find_desc=Brunch", icon: Coffee },
          { label: "Fine Dining & Buffets", href: "/search?find_desc=Fine+Dining", icon: Wine },
        ],
      },
      {
        heading: "Local Favorites",
        items: [
          { label: "Rice & Curry", href: "/search?find_desc=Rice+and+Curry", icon: Utensils },
          { label: "Kottu & Street Food", href: "/search?find_desc=Kottu", icon: ChefHat },
          { label: "Cafes & Bakeries", href: "/search?category=cafe-bakery", icon: Coffee },
          { label: "Seafood Specialties", href: "/search?find_desc=Seafood", icon: Fish },
        ],
      },
      {
        heading: "Cuisines & Drinks",
        items: [
          { label: "Chinese & Asian", href: "/search?find_desc=Chinese", icon: Soup },
          { label: "Indian & Biryani", href: "/search?find_desc=Indian", icon: UtensilsCrossed },
          { label: "Italian & Pizza", href: "/search?find_desc=Pizza", icon: Pizza },
          { label: "Nightlife & Pubs", href: "/search?category=nightlife-bars", icon: Beer },
        ],
      },
    ],
  },
  {
    id: "home-services",
    label: "Home Services",
    icon: Wrench,
    href: "/search?category=home-services",
    featuredLink: {
      label: "Find top-rated Home Professionals",
      href: "/search?category=home-services",
    },
    columns: [
      {
        heading: "Repairs & Utilities",
        items: [
          { label: "AC Repair & Service", href: "/search?find_desc=AC+Repair", icon: Wind },
          { label: "Electricians", href: "/search?find_desc=Electrician", icon: Zap },
          { label: "Plumbers", href: "/search?find_desc=Plumber", icon: Droplets },
          { label: "Contractors & Handymen", href: "/search?category=home-services", icon: Hammer },
        ],
      },
      {
        heading: "Maintenance",
        items: [
          { label: "Appliance Repair", href: "/search?find_desc=Appliance+Repair", icon: Tv },
          { label: "House Painters", href: "/search?find_desc=Painters", icon: Paintbrush },
          { label: "Roofing & Waterproofing", href: "/search?find_desc=Roofing", icon: Home },
          { label: "Locksmiths & Security", href: "/search?find_desc=Locksmith", icon: Key },
        ],
      },
      {
        heading: "Living & Outdoor",
        items: [
          { label: "Home Cleaning", href: "/search?find_desc=Cleaning", icon: Brush },
          { label: "Landscaping & Gardening", href: "/search?find_desc=Gardening", icon: Trees },
          { label: "Pest Control", href: "/search?find_desc=Pest+Control", icon: ShieldAlert },
          { label: "Movers & Packers", href: "/search?find_desc=Movers", icon: Truck },
        ],
      },
    ],
  },
  {
    id: "auto-services",
    label: "Auto Services",
    icon: Car,
    href: "/search?category=auto-repair",
    featuredLink: {
      label: "Find reliable mechanics & vehicle repair",
      href: "/search?category=auto-repair",
    },
    columns: [
      {
        heading: "Vehicle Repairs",
        items: [
          { label: "Three-Wheeler & Tuk Repair", href: "/search?category=tuk-repair", icon: Car },
          { label: "Auto Garages & Mechanics", href: "/search?category=auto-repair", icon: Wrench },
          { label: "Electronic & Hybrid Diagnosis", href: "/search?find_desc=Hybrid+Repair", icon: Cpu },
        ],
      },
      {
        heading: "Routine Care",
        items: [
          { label: "Tyre Replacement & Alignment", href: "/search?find_desc=Tyres", icon: CircleDot },
          { label: "Oil Change & Lubrication", href: "/search?find_desc=Oil+Change", icon: Droplet },
          { label: "Car Wash & Auto Detailing", href: "/search?find_desc=Car+Wash", icon: Waves },
        ],
      },
      {
        heading: "Support & Parts",
        items: [
          { label: "Breakdown & Towing 24/7", href: "/search?find_desc=Towing", icon: Truck },
          { label: "Auto Spare Parts", href: "/search?find_desc=Spare+Parts", icon: Cog },
          { label: "Battery Replacement", href: "/search?find_desc=Car+Battery", icon: BatteryCharging },
        ],
      },
    ],
  },
  {
    id: "beauty-wellness",
    label: "Beauty & Spas",
    icon: Flower2,
    href: "/search?category=beauty-spa",
    featuredLink: {
      label: "Browse spas, salons, and beauty services",
      href: "/search?category=beauty-spa",
    },
    columns: [
      {
        heading: "Spas & Rejuvenation",
        items: [
          { label: "Ayurveda & Herbal Spas", href: "/search?find_desc=Ayurveda", icon: Leaf },
          { label: "Day Spas & Full Body Massage", href: "/search?category=beauty-spa", icon: HeartHandshake },
          { label: "Hot Springs & Resort Spas", href: "/search?find_desc=Spa+Resort", icon: Waves },
        ],
      },
      {
        heading: "Hair & Grooming",
        items: [
          { label: "Hair Salons & Styling", href: "/search?find_desc=Hair+Salon", icon: Scissors },
          { label: "Barbershops & Men's Grooming", href: "/search?find_desc=Barbershop", icon: Scissors },
          { label: "Bridal Hair & Dressing", href: "/search?find_desc=Bridal+Salon", icon: Crown },
        ],
      },
      {
        heading: "Health & Fitness",
        items: [
          { label: "Nail Salons & Pedicures", href: "/search?find_desc=Nail+Salon", icon: Hand },
          { label: "Skin & Dermatological Clinics", href: "/search?find_desc=Skin+Care", icon: Activity },
          { label: "Fitness Centers & Gyms", href: "/search?find_desc=Gym", icon: Dumbbell },
        ],
      },
    ],
  },
  {
    id: "things-to-do",
    label: "Things to Do",
    icon: Compass,
    href: "/search?category=lodging",
    featuredLink: {
      label: "Discover things to do in Sri Lanka",
      href: "/search?find_desc=Activities",
    },
    columns: [
      {
        heading: "Outdoors & Leisure",
        items: [
          { label: "Hotels & Guesthouses", href: "/search?category=lodging", icon: BedDouble },
          { label: "Beaches & Water Sports", href: "/search?find_desc=Beach", icon: Waves },
          { label: "Parks & Walking Tracks", href: "/search?find_desc=Parks", icon: Trees },
        ],
      },
      {
        heading: "Culture & Sights",
        items: [
          { label: "Museums & Art Galleries", href: "/search?find_desc=Museums", icon: Landmark },
          { label: "Historic Forts & Temples", href: "/search?find_desc=Temples", icon: Landmark },
          { label: "Shopping Malls & Markets", href: "/search?category=retail-shopping", icon: ShoppingBag },
        ],
      },
      {
        heading: "Entertainment",
        items: [
          { label: "Cinema & Live Theatres", href: "/search?find_desc=Cinema", icon: Camera },
          { label: "Nightlife & Rooftop Lounges", href: "/search?category=nightlife-bars", icon: Wine },
          { label: "Gaming & Arcades", href: "/search?find_desc=Bowling", icon: PartyPopper },
        ],
      },
    ],
  },
  {
    id: "more",
    label: "More",
    icon: MoreHorizontal,
    href: "/directory",
    featuredLink: {
      label: "View all categories & businesses",
      href: "/directory",
    },
    columns: [
      {
        heading: "Education & Events",
        items: [
          { label: "Tuition & Tutoring", href: "/search?category=tutoring", icon: GraduationCap },
          { label: "Wedding & Event Vendors", href: "/search?category=wedding-vendors", icon: PartyPopper },
          { label: "Photography & Studios", href: "/search?find_desc=Photography", icon: Camera },
        ],
      },
      {
        heading: "Style & Essentials",
        items: [
          { label: "Tailoring & Garments", href: "/search?category=tailoring", icon: Scissors },
          { label: "Dry Cleaning & Laundry", href: "/search?find_desc=Dry+Cleaning", icon: Brush },
          { label: "Grocery & Convenience", href: "/search?category=grocery-convenience", icon: ShoppingBasket },
        ],
      },
      {
        heading: "Professional",
        items: [
          { label: "Legal & Notary Services", href: "/search?find_desc=Legal", icon: Scale },
          { label: "Accounting & Tax Services", href: "/search?find_desc=Accounting", icon: Calculator },
          { label: "Real Estate Agents", href: "/search?find_desc=Real+Estate", icon: Building },
        ],
      },
    ],
  },
];

export function MegaMenu({ isOverlay = false }: { isOverlay?: boolean }) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Reset dropdown whenever route or search parameters change
  useEffect(() => {
    setActiveTab(null);
  }, [pathname, searchParams]);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveTab(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveTab(null);
    }, 180);
  };

  const handleTabClick = (cat: MegaCategory) => {
    // If clicked, navigate to category landing page and close dropdown
    setActiveTab(null);
    router.push(cat.href);
  };

  return (
    <nav
      className={cn(
        "relative hidden lg:block select-none transition-colors duration-200",
        isOverlay
          ? "border-t border-white/10 bg-transparent"
          : "border-t border-border/60 bg-white",
      )}
      onMouseLeave={handleMouseLeave}
      aria-label="Category Navigation"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 xl:px-8">
        <ul className="flex items-center gap-1 py-1">
          {MEGA_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;

            return (
              <li
                key={cat.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.id)}
              >
                {/* Category Button/Link: Subtle simple animation on hover */}
                <button
                  type="button"
                  onClick={() => handleTabClick(cat)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer",
                    isActive
                      ? isOverlay
                        ? "bg-white/20 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-900 shadow-xs"
                      : isOverlay
                        ? "text-white/90 hover:bg-white/15 hover:text-white"
                        : "text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900",
                  )}
                  aria-expanded={isActive}
                  aria-haspopup="true"
                >
                  <Icon
                    className={cn(
                      "size-[17px] shrink-0 stroke-[2.2] transition-colors",
                      isOverlay ? "text-white/90" : "text-neutral-600",
                    )}
                  />
                  <span>{cat.label}</span>
                  {/* Subtle bold chevron arrow: static, never flips or rotates */}
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 stroke-[2.2]",
                      isOverlay ? "text-white/70" : "text-neutral-400 opacity-80",
                    )}
                  />
                </button>

                {/* Yelp-style Anchored Popover Dropdown Card */}
                {isActive && (
                  <div
                    className={cn(
                      "absolute top-full z-50 mt-1 rounded-xl border border-neutral-200/90 bg-white p-5 shadow-2xl transition-all",
                      "animate-in fade-in-0 zoom-in-95 duration-150",
                      // Invisible hover bridge so mouse movement never loses hover
                      "before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']",
                      cat.id === "more" || cat.id === "things-to-do"
                        ? "right-0 w-[580px]"
                        : "left-0 w-[600px]",
                    )}
                    onMouseEnter={() => {
                      if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {cat.columns.map((col, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          {col.heading && (
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2.5">
                              {col.heading}
                            </h4>
                          )}
                          <ul className="flex flex-col gap-0.5">
                            {col.items.map((item, itemIdx) => {
                              const ItemIcon = item.icon;
                              return (
                                <li key={itemIdx}>
                                  <Link
                                    href={item.href}
                                    onClick={() => setActiveTab(null)}
                                    className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-neutral-700 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-950 hover:translate-x-0.5"
                                  >
                                    <ItemIcon className="size-4 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-900 stroke-[2]" />
                                    <span className="truncate">{item.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {cat.featuredLink && (
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold px-2.5">
                        <Link
                          href={cat.featuredLink.href}
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-1.5 text-[#007692] hover:text-[#005569] transition-colors"
                        >
                          <span>{cat.featuredLink.label}</span>
                          <ArrowRight className="size-3.5" />
                        </Link>

                        <Link
                          href="/directory"
                          onClick={() => setActiveTab(null)}
                          className="text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                          Explore all in Sri Lanka
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href="/directory"
            className={cn(
              "flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-md",
              isOverlay
                ? "text-white/80 hover:text-white hover:bg-white/15"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
            )}
          >
            <span>Browse Directory</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default MegaMenu;
