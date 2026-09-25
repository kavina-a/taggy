import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { updateCollectionSchema } from "@/lib/validation/collection.schema";
import { uniqueCollectionSlug } from "@/lib/collections/ensure-default";
import { slugifyBusinessName } from "@/lib/businesses/slugify";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function ownedCollection(id: string, userId: string) {
  return prisma.collection.findFirst({
    where: { id, userId },
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const collection = await ownedCollection(id, session.userId);
  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = updateCollectionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data: { name?: string; slug?: string; isPublic?: boolean } = {};
  if (parsed.data.name !== undefined) {
    data.name = parsed.data.name;
    if (!collection.isDefault) {
      data.slug = await uniqueCollectionSlug(slugifyBusinessName(parsed.data.name));
    }
  }
  if (parsed.data.isPublic !== undefined) {
    data.isPublic = parsed.data.isPublic;
  }

  const updated = await prisma.collection.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    isDefault: updated.isDefault,
    isPublic: updated.isPublic,
  });
}
