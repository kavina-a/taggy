import { Badge } from "@/components/ui/badge";
import { attributeSchemaByCategory } from "@/lib/categories/category-config";

export interface AttributeBadgesProps {
  primaryCategory: string;
  attributes: Record<string, unknown>;
}

// Per-field-key -> human label map, covering every attribute key across all
// 16 leaf-category schemas in lib/categories/category-config.ts.
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
  genderSpecificServices: "Gender-Specific Services",
  acceptsInsurance: "Accepts Insurance",
  dayPassAvailable: "Day Pass Available",
  trainerAvailable: "Trainer Available",
  ageGroup: "Age Group",
  onlineAvailable: "Online Available",
  homeVisitsAvailable: "Home Visits Available",
  vendorType: "Vendor Type",
  customFitting: "Custom Fitting",
  alterationsOnly: "Alterations Only",
  consultationFeeRequired: "Consultation Fee Required",
  breakfastIncluded: "Breakfast Included",
};

// Enum default values that mean "not meaningfully set" — skip these rather
// than rendering a badge that says nothing useful.
const NON_INFORMATIVE_ENUM_VALUES = new Set(["none", "all", "other"]);

function humanLabel(key: string): string {
  return ATTRIBUTE_LABELS[key] ?? key;
}

function priceTierLabel(tier: number): string {
  return "$".repeat(Math.max(1, Math.min(4, tier)));
}

export function AttributeBadges({ primaryCategory, attributes }: AttributeBadgesProps) {
  const schema = attributeSchemaByCategory[primaryCategory];
  if (!schema) return null;

  // Never throw at render time on stale/legacy data — safeParse only.
  const result = schema.safeParse(attributes);
  if (!result.success) return null;

  const parsed = result.data as Record<string, unknown>;
  const badges: { key: string; label: string }[] = [];

  for (const [key, value] of Object.entries(parsed)) {
    if (key === "priceTier" && typeof value === "number") {
      badges.push({ key, label: priceTierLabel(value) });
      continue;
    }
    if (typeof value === "boolean") {
      if (value) badges.push({ key, label: humanLabel(key) });
      continue;
    }
    if (typeof value === "string" && !NON_INFORMATIVE_ENUM_VALUES.has(value)) {
      badges.push({ key, label: humanLabel(key) });
      continue;
    }
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge key={badge.key} variant="outline" data-testid="attribute-badge">
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}

export default AttributeBadges;
