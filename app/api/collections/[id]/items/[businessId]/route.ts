import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ensureDefaultCollection } from "@/lib/collections/ensure-default";

interface RouteParams {
  params: Promise<{ id: string; businessId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, businessId } = await params;
  let collection = await prisma.collection.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });
  if (!collection && id === "default") {
    collection = await ensureDefaultCollection(session.userId);
  }
  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  await prisma.collectionItem.deleteMany({
    where: { collectionId: collection.id, businessId },
  });

  return NextResponse.json({ ok: true });
}
