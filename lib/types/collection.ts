export interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  isPublic: boolean;
  itemCount: number;
}

export interface CollectionMembership {
  id: string;
  name: string;
  containsBusiness: boolean;
}
