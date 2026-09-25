import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createCollectionSchema } from "@/lib/validation/collection.schema";
import {
  createNamedCollection,
  ensureDefaultCollection,
} from "@/lib/collections/ensure-default";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultCollection(session.userId);
  const collections = await prisma.collection.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json({
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isDefault: c.isDefault,
      isPublic: c.isPublic,
      itemCount: c._count.items,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = createCollectionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const created = await createNamedCollection(session.userId, parsed.data.name);
  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      slug: created.slug,
      isDefault: created.isDefault,
      isPublic: created.isPublic,
    },
    { status: 201 },
  );
}
