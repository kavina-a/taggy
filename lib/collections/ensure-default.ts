import { prisma } from "@/lib/prisma";
import { slugifyBusinessName } from "@/lib/businesses/slugify";
import { DEFAULT_COLLECTION_NAME } from "@/lib/validation/collection.schema";

export async function uniqueCollectionSlug(base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 8; i += 1) {
    const clash = await prisma.collection.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function ensureDefaultCollection(userId: string) {
  const existing = await prisma.collection.findFirst({
    where: { userId, isDefault: true },
  });
  if (existing) return existing;

  const slug = await uniqueCollectionSlug(`saved-${userId.slice(0, 10)}`);
  return prisma.collection.create({
    data: {
      userId,
      name: DEFAULT_COLLECTION_NAME,
      slug,
      isDefault: true,
      isPublic: false,
    },
  });
}

export async function createNamedCollection(userId: string, name: string) {
  const slug = await uniqueCollectionSlug(slugifyBusinessName(name));
  return prisma.collection.create({
    data: {
      userId,
      name,
      slug,
      isDefault: false,
      isPublic: false,
    },
  });
}
