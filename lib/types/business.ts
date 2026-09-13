export interface BusinessHoursRow {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  crossesMidnight: boolean;
}

export interface BusinessHoursOverrideRow {
  date: string; // "yyyy-MM-dd"
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  crossesMidnight: boolean;
}

export interface BusinessPhotoRow {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  isMenuPhoto: boolean;
}

export interface BusinessDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  primaryCategories: string[];
  secondaryCategories: string[];
  district: string;
  addressFreeText: string;
  latitude: number;
  longitude: number;
  attributes: Record<string, unknown>;
  hours: BusinessHoursRow[];
  hoursOverrides: BusinessHoursOverrideRow[];
  photos: BusinessPhotoRow[];
}
