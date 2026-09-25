import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { updateListingSchema } from "@/lib/validation/update-listing.schema";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, claimedByUserId: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }
  if (business.claimedByUserId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsedBody = updateListingSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { description, addressFreeText, hours } = parsedBody.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (hours) {
      await tx.businessHours.deleteMany({ where: { businessId: business.id } });
      if (hours.length > 0) {
        await tx.businessHours.createMany({
          data: hours.map((row) => ({
            businessId: business.id,
            dayOfWeek: row.dayOfWeek,
            openTime: row.openTime,
            closeTime: row.closeTime,
            crossesMidnight: row.crossesMidnight,
          })),
        });
      }
    }

    return tx.business.update({
      where: { id: business.id },
      data: {
        ...(description !== undefined ? { description } : {}),
        ...(addressFreeText !== undefined ? { addressFreeText } : {}),
      },
      select: { slug: true, description: true, addressFreeText: true },
    });
  });

  return NextResponse.json(updated);
}
