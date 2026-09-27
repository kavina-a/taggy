import Link from "next/link";
import { Wrench, Car, Zap, Paintbrush, Wind, Droplets, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Service Cost Guides in Sri Lanka | LankaReview",
  description: "Accurate cost estimates for AC repair, vehicle service, plumbers, electricians, and home contractors in Colombo and Sri Lanka.",
};

interface CostGuideItem {
  id: string;
  title: string;
  category: string;
  icon: typeof Wrench;
  low: string;
  typical: string;
  high: string;
  unit: string;
  description: string;
  searchHref: string;
  factors: string[];
}

const COST_GUIDES: CostGuideItem[] = [
  {
    id: "ac-repair",
    title: "Air Conditioning Repair & Servicing",
    category: "Home Services",
    icon: Wind,
    low: "Rs. 2,500",
    typical: "Rs. 4,500 – 6,500",
    high: "Rs. 15,000+",
    unit: "per standard split AC unit",
    description: "Standard filter cleaning, chemical wash, refrigerant gas top-up, and outdoor condenser maintenance in Colombo.",
    searchHref: "/search?category=home-services",
    factors: ["Inverter vs. Non-inverter technology", "Refrigerant leak detection & charging", "Gas R32 vs R410A type", "High-rise balcony accessibility"],
  },
  {
    id: "plumber",
    title: "Plumber & Pipe Leak Repair",
    category: "Home Services",
    icon: Droplets,
    low: "Rs. 1,500",
    typical: "Rs. 3,500 – 5,500",
    high: "Rs. 18,000+",
    unit: "per job or day call-out",
    description: "Bathroom fixture installation, clearing blocked drainage, pressure booster pump repairs, and underground pipeline leak fixes.",
    searchHref: "/search?category=home-services",
    factors: ["Concealed wall piping vs surface plumbing", "Water pump / pressure tank replacement", "Emergency after-hours callout fee"],
  },
  {
    id: "electrician",
    title: "Electrician & House Wiring",
    category: "Home Services",
    icon: Zap,
    low: "Rs. 2,000",
    typical: "Rs. 4,000 – 8,000",
    high: "Rs. 35,000+",
    unit: "per inspection / point wiring",
    description: "Short circuit troubleshooting, distribution board (DB) breaker replacement, ceiling fan & chandelier installation, and generator hookups.",
    searchHref: "/search?category=home-services",
    factors: ["Number of electrical points wired", "Trip switch (RCCB) / surge protector replacement", "Three-phase vs single-phase supply"],
  },
  {
    id: "tuk-repair",
    title: "Three-Wheeler & Tuk Servicing",
    category: "Auto Repair",
    icon: Car,
    low: "Rs. 2,000",
    typical: "Rs. 4,500 – 7,500",
    high: "Rs. 22,000+",
    unit: "routine service & tune-up",
    description: "Engine oil change, brake shoe adjustments, carburetor tuning, clutch cable replacement, and wheel hub bearing checks.",
    searchHref: "/search?category=auto-repair",
    factors: ["Genuine Bajaj / TVS spare parts", "Brake drum machining or replacement", "Engine rebore or complete overhaul"],
  },
  {
    id: "auto-mechanic",
    title: "Automotive Full Service & Diagnostics",
    category: "Auto Repair",
    icon: Wrench,
    low: "Rs. 8,500",
    typical: "Rs. 14,000 – 25,000",
    high: "Rs. 65,000+",
    unit: "comprehensive lube & inspection",
    description: "Computer engine scan, synthetic motor oil change, transmission fluid flush, brake inspection, suspension check, and wheel alignment.",
    searchHref: "/search?category=auto-repair",
    factors: ["Fully synthetic vs semi-synthetic engine oil", "Hybrid battery health & cooling fan clean", "Japanese vs European vehicle make"],
  },
  {
    id: "house-painting",
    title: "House Painting & Waterproofing",
    category: "Home Services",
    icon: Paintbrush,
    low: "Rs. 35 / sq.ft",
    typical: "Rs. 55 – 85 / sq.ft",
    high: "Rs. 140 / sq.ft",
    unit: "labor & surface preparation",
    description: "Exterior weather-shield painting, interior emulsion roll, crack puttying, wall scraping, and roof slab waterproofing.",
    searchHref: "/search?category=home-services",
    factors: ["Wall primer & sealer coats required", "Scaffolding for multi-story buildings", "Damp-proof waterproofing membrane treatment"],
  },
];

export default function CostsPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-10 md:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Header Hero */}
        <header className="flex flex-col gap-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <ShieldCheck className="size-4 text-[#D71616]" />
            <span>Fair Price Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            How Much Do Local Services Cost in Sri Lanka?
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Real cost estimates and price benchmarks collected from thousands of verified local Sri Lankan service providers. Compare typical rates before hiring.
          </p>
        </header>

        {/* Cost Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COST_GUIDES.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col gap-4">
                  {/* Title & Category */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-200">
                        <Icon className="size-5 text-[#D71616]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 leading-snug">
                          {item.title}
                        </h2>
                        <span className="text-xs text-neutral-500 font-medium">
                          {item.category} &middot; {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Price Range Visualizer Bar */}
                  <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
                      <span>Low End</span>
                      <span className="font-bold text-neutral-900">Typical Average</span>
                      <span>High End</span>
                    </div>

                    {/* Gradient Bar */}
                    <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400 opacity-90 shadow-inner" />

                    <div className="flex items-center justify-between text-xs font-bold text-neutral-900 pt-0.5">
                      <span className="text-emerald-700">{item.low}</span>
                      <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-xs font-extrabold border border-amber-300">
                        {item.typical}
                      </span>
                      <span className="text-neutral-700">{item.high}</span>
                    </div>
                  </div>

                  {/* Key Price Factors */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      What influences the price:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-600">
                      {item.factors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-500">
                    Get free quotes from verified pros
                  </span>
                  <Button asChild size="sm" className="bg-[#D71616] hover:bg-[#B80F0F] text-white rounded-full px-5 text-xs font-bold gap-1.5 shadow-sm">
                    <Link href={item.searchHref}>
                      <span>Find Specialists</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
