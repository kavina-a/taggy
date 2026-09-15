"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { categoryTaxonomy, getBooleanAttributeFields } from "@/lib/categories/category-config";
import { PRICE_TIERS, RADIUS_STOPS, RATING_OPTIONS, type FilterState } from "./filter-state";

export interface FilterFieldsProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
}

const LEAF_CATEGORIES = categoryTaxonomy.flatMap((group) => group.categories);

// Human labels for the boolean-typed attribute keys across every category
// schema in lib/categories/category-config.ts (restricted to boolean fields
// only, per 02-UI-SPEC.md's "checkboxes" wording for category-conditional
// attributes).
const ATTRIBUTE_LABELS: Record<string, string> = {
  delivery: "Delivery",
  deliveryAvailable: "Delivery Available",
  takeout: "Takeout",
  dineIn: "Dine-in",
  outdoorSeating: "Outdoor Seating",
  goodForGroups: "Good for Groups",
  goodForKids: "Good for Kids",
  alcoholServed: "Alcohol Served",
  reservationsAccepted: "Reservations Accepted",
  wifi: "Wifi",
  parking: "Parking",
  liveMusic: "Live Music",
  foodServed: "Food Served",
  returnsAccepted: "Returns Accepted",
  open24Hours: "Open 24 Hours",
  licenseVerified: "License Verified",
  freeEstimates: "Free Estimates",
  emergencyService: "Emergency Service",
  sparePartsAvailable: "Spare Parts Available",
  walkInsWelcome: "Walk-ins Welcome",
  appointmentRequired: "Appointment Required",
  acceptsInsurance: "Accepts Insurance",
  dayPassAvailable: "Day Pass Available",
  trainerAvailable: "Trainer Available",
  onlineAvailable: "Online Available",
  homeVisitsAvailable: "Home Visits Available",
  customFitting: "Custom Fitting",
  alterationsOnly: "Alterations Only",
  consultationFeeRequired: "Consultation Fee Required",
  breakfastIncluded: "Breakfast Included",
};

function attributeLabel(key: string): string {
  return ATTRIBUTE_LABELS[key] ?? key;
}

function radiusIndex(radiusKm: number | undefined): number {
  if (radiusKm == null) return RADIUS_STOPS.length - 1;
  const idx = RADIUS_STOPS.indexOf(radiusKm);
  return idx === -1 ? RADIUS_STOPS.length - 1 : idx;
}

const chipClass = (selected: boolean) =>
  `min-h-11 rounded-md border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
    selected ? "border-brand-accent bg-brand-accent text-white" : "border-input bg-background"
  }`;

// Shared filter-controls markup rendered identically by both FilterSidebar
// (desktop) and FilterSheet (mobile) — avoids duplicating the checkbox/
// slider/chip JSX in two places (02-08-PLAN.md Task 1).
export function FilterFields({ filters, onChange }: FilterFieldsProps) {
  const activeAttributeKeys = Array.from(
    new Set(filters.categories.flatMap((slug) => getBooleanAttributeFields(slug))),
  );

  function toggleCategory(slug: string, checked: boolean) {
    const nextCategories = checked
      ? [...filters.categories, slug]
      : filters.categories.filter((c) => c !== slug);
    const validKeys = new Set(nextCategories.flatMap((s) => getBooleanAttributeFields(s)));
    const nextAttrs = Object.fromEntries(
      Object.entries(filters.attrs).filter(([key, value]) => value && validKeys.has(key)),
    );
    onChange({ categories: nextCategories, attrs: nextAttrs });
  }

  function togglePriceTier(tier: number) {
    const next = filters.priceTiers.includes(tier)
      ? filters.priceTiers.filter((t) => t !== tier)
      : [...filters.priceTiers, tier];
    onChange({ priceTiers: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-medium">Category</legend>
        {LEAF_CATEGORIES.map((category) => (
          <label key={category.slug} className="flex min-h-11 items-center gap-2 text-base">
            <Checkbox
              checked={filters.categories.includes(category.slug)}
              onCheckedChange={(checked) => toggleCategory(category.slug, checked === true)}
              aria-label={category.label}
            />
            {category.label}
          </label>
        ))}
      </fieldset>

      {activeAttributeKeys.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-base font-medium">Amenities</legend>
          {activeAttributeKeys.map((key) => (
            <label key={key} className="flex min-h-11 items-center gap-2 text-base">
              <Checkbox
                checked={filters.attrs[key] === true}
                onCheckedChange={(checked) =>
                  onChange({ attrs: { ...filters.attrs, [key]: checked === true } })
                }
                aria-label={attributeLabel(key)}
              />
              {attributeLabel(key)}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-medium">Price</legend>
        <div className="flex gap-2">
          {PRICE_TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              aria-pressed={filters.priceTiers.includes(tier)}
              onClick={() => togglePriceTier(tier)}
              className={chipClass(filters.priceTiers.includes(tier))}
            >
              {"$".repeat(tier)}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex min-h-11 items-center gap-2 text-base">
        <Checkbox
          checked={filters.openNow}
          onCheckedChange={(checked) => onChange({ openNow: checked === true })}
          aria-label="Open now"
        />
        Open now
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-medium">Distance</legend>
        <Slider
          min={0}
          max={RADIUS_STOPS.length - 1}
          step={1}
          value={[radiusIndex(filters.radiusKm)]}
          onValueChange={([idx]) => onChange({ radiusKm: RADIUS_STOPS[idx] })}
          aria-label="Distance radius"
        />
        <p className="text-sm text-muted-foreground">
          Within {filters.radiusKm ?? RADIUS_STOPS[RADIUS_STOPS.length - 1]} km
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-medium">Rating</legend>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filters.rating === option}
              onClick={() => onChange({ rating: option })}
              className={chipClass(filters.rating === option)}
            >
              {option === "any" ? "Any" : `${option}+`}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default FilterFields;
