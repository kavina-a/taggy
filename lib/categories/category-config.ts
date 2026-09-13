import { z } from "zod";

// Full LIST-05 category taxonomy: 9 top-level groups, 16 leaf categories.
// Includes the 4 Sri Lanka-specific leaf categories (tuk-repair, tutoring,
// wedding-vendors, tailoring) per CONTEXT.md D-04 / PROJECT.md's
// primary/secondary-vertical strategy.
export const categoryTaxonomy: {
  groupSlug: string;
  groupLabel: string;
  categories: { slug: string; label: string }[];
}[] = [
  {
    groupSlug: "food-dining",
    groupLabel: "Food & Dining",
    categories: [
      { slug: "restaurant", label: "Restaurants" },
      { slug: "cafe-bakery", label: "Cafes & Bakeries" },
      { slug: "nightlife-bars", label: "Nightlife & Bars" },
    ],
  },
  {
    groupSlug: "shopping-retail",
    groupLabel: "Shopping & Retail",
    categories: [
      { slug: "retail-shopping", label: "Retail & Shopping" },
      { slug: "grocery-convenience", label: "Grocery & Convenience" },
    ],
  },
  {
    groupSlug: "home-local-services",
    groupLabel: "Home & Local Services",
    categories: [
      { slug: "home-services", label: "Home Services" },
      { slug: "tuk-repair", label: "Three-Wheeler & Vehicle Repair" },
      { slug: "auto-repair", label: "Automotive Services" },
    ],
  },
  {
    groupSlug: "beauty-wellness",
    groupLabel: "Beauty & Wellness",
    categories: [
      { slug: "beauty-spa", label: "Beauty & Spas" },
      { slug: "health-medical", label: "Health & Medical" },
      { slug: "fitness-recreation", label: "Fitness & Recreation" },
    ],
  },
  {
    groupSlug: "education",
    groupLabel: "Education",
    categories: [{ slug: "tutoring", label: "Tuition & Tutoring" }],
  },
  {
    groupSlug: "events-weddings",
    groupLabel: "Events & Weddings",
    categories: [{ slug: "wedding-vendors", label: "Wedding & Event Vendors" }],
  },
  {
    groupSlug: "fashion-tailoring",
    groupLabel: "Fashion & Tailoring",
    categories: [{ slug: "tailoring", label: "Tailoring & Garments" }],
  },
  {
    groupSlug: "professional-services",
    groupLabel: "Professional Services",
    categories: [
      { slug: "professional-services", label: "Professional Services" },
    ],
  },
  {
    groupSlug: "travel-lodging",
    groupLabel: "Travel & Lodging",
    categories: [{ slug: "lodging", label: "Hotels & Guesthouses" }],
  },
];

const priceTier = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

// Restaurants (Food & Dining) — per 01-RESEARCH.md Pattern 3's exact example.
const restaurantAttributesSchema = z
  .object({
    delivery: z.boolean().default(false),
    takeout: z.boolean().default(false),
    dineIn: z.boolean().default(true),
    outdoorSeating: z.boolean().default(false),
    goodForGroups: z.boolean().default(false),
    goodForKids: z.boolean().default(false),
    alcoholServed: z.boolean().default(false),
    reservationsAccepted: z.boolean().default(false),
    priceTier,
    parking: z.enum(["none", "street", "lot", "valet"]).optional(),
    wifi: z.boolean().default(false),
  })
  .strict();

const cafeBakeryAttributesSchema = z
  .object({
    wifi: z.boolean().default(false),
    outdoorSeating: z.boolean().default(false),
    takeout: z.boolean().default(false),
    delivery: z.boolean().default(false),
    priceTier,
  })
  .strict();

const nightlifeBarsAttributesSchema = z
  .object({
    liveMusic: z.boolean().default(false),
    outdoorSeating: z.boolean().default(false),
    foodServed: z.boolean().default(false),
    priceTier,
  })
  .strict();

const retailShoppingAttributesSchema = z
  .object({
    priceTier,
    deliveryAvailable: z.boolean().default(false),
    returnsAccepted: z.boolean().default(false),
  })
  .strict();

const groceryConvenienceAttributesSchema = z
  .object({
    open24Hours: z.boolean().default(false),
    delivery: z.boolean().default(false),
    priceTier,
  })
  .strict();

// Home Services — per 01-RESEARCH.md Pattern 3's exact example.
const homeServicesAttributesSchema = z
  .object({
    licenseVerified: z.boolean().default(false),
    freeEstimates: z.boolean().default(false),
    emergencyService: z.boolean().default(false),
    yearsInBusiness: z.number().int().nonnegative().optional(),
    serviceAreaRadiusKm: z.number().positive().optional(),
  })
  .strict();

const tukRepairAttributesSchema = z
  .object({
    licenseVerified: z.boolean().default(false),
    emergencyService: z.boolean().default(false),
    freeEstimates: z.boolean().default(false),
    yearsInBusiness: z.number().int().nonnegative().optional(),
    sparePartsAvailable: z.boolean().default(false),
  })
  .strict();

const autoRepairAttributesSchema = z
  .object({
    licenseVerified: z.boolean().default(false),
    freeEstimates: z.boolean().default(false),
    emergencyService: z.boolean().default(false),
    yearsInBusiness: z.number().int().nonnegative().optional(),
    servicesOffered: z.array(z.string()).default([]),
  })
  .strict();

// Beauty & Spas — per 01-RESEARCH.md Pattern 3's exact example.
const beautySpaAttributesSchema = z
  .object({
    walkInsWelcome: z.boolean().default(false),
    appointmentRequired: z.boolean().default(true),
    genderSpecificServices: z.enum(["none", "women", "men", "both"]).default("none"),
    priceTier,
  })
  .strict();

const healthMedicalAttributesSchema = z
  .object({
    acceptsInsurance: z.boolean().default(false),
    appointmentRequired: z.boolean().default(true),
    emergencyService: z.boolean().default(false),
    languagesSpoken: z.array(z.string()).default([]),
  })
  .strict();

const fitnessRecreationAttributesSchema = z
  .object({
    dayPassAvailable: z.boolean().default(false),
    trainerAvailable: z.boolean().default(false),
    priceTier,
  })
  .strict();

const tutoringAttributesSchema = z
  .object({
    subjects: z.array(z.string()).default([]),
    ageGroup: z.enum(["children", "teens", "adults", "all"]).default("all"),
    onlineAvailable: z.boolean().default(false),
    homeVisitsAvailable: z.boolean().default(false),
  })
  .strict();

const weddingVendorsAttributesSchema = z
  .object({
    vendorType: z
      .enum(["photography", "catering", "decor", "venue", "other"])
      .default("other"),
    advanceBookingRequiredMonths: z.number().int().nonnegative().optional(),
    priceTier,
  })
  .strict();

const tailoringAttributesSchema = z
  .object({
    customFitting: z.boolean().default(false),
    alterationsOnly: z.boolean().default(false),
    turnaroundDays: z.number().int().positive().optional(),
    priceTier,
  })
  .strict();

const professionalServicesAttributesSchema = z
  .object({
    consultationFeeRequired: z.boolean().default(false),
    appointmentRequired: z.boolean().default(true),
    languagesSpoken: z.array(z.string()).default([]),
  })
  .strict();

const lodgingAttributesSchema = z
  .object({
    priceTier,
    wifi: z.boolean().default(false),
    parking: z.boolean().default(false),
    breakfastIncluded: z.boolean().default(false),
  })
  .strict();

// Keyed by leaf category slug — every leaf slug in categoryTaxonomy above
// must have a matching key here (enforced by category-config.test.ts).
export const attributeSchemaByCategory: Record<string, z.ZodTypeAny> = {
  restaurant: restaurantAttributesSchema,
  "cafe-bakery": cafeBakeryAttributesSchema,
  "nightlife-bars": nightlifeBarsAttributesSchema,
  "retail-shopping": retailShoppingAttributesSchema,
  "grocery-convenience": groceryConvenienceAttributesSchema,
  "home-services": homeServicesAttributesSchema,
  "tuk-repair": tukRepairAttributesSchema,
  "auto-repair": autoRepairAttributesSchema,
  "beauty-spa": beautySpaAttributesSchema,
  "health-medical": healthMedicalAttributesSchema,
  "fitness-recreation": fitnessRecreationAttributesSchema,
  tutoring: tutoringAttributesSchema,
  "wedding-vendors": weddingVendorsAttributesSchema,
  tailoring: tailoringAttributesSchema,
  "professional-services": professionalServicesAttributesSchema,
  lodging: lodgingAttributesSchema,
};
