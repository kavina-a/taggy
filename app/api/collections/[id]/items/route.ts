import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addCollectionItemSchema } from "@/lib/validation/collection.schema";
import { ensureDefaultCollection } from "@/lib/collections/ensure-default";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let collection = await prisma.collection.findFirst({
    where: { id, userId: session.userId },
  });
  if (!collection && id === "default") {
    collection = await ensureDefaultCollection(session.userId);
  }
  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = addCollectionItemSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id: parsed.data.businessId },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    await prisma.collectionItem.create({
      data: { collectionId: collection.id, businessId: business.id },
    });
  } catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
      throw err;
    }
  }

  return NextResponse.json({ ok: true, collectionId: collection.id });
}
