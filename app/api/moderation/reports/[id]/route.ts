import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/moderation/require-moderator";
import { updateReportStatusSchema } from "@/lib/validation/moderation.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const gate = await requireModerator();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const parsedBody = updateReportStatusSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await prisma.report.findUnique({
    where: { id },
    select: { id: true, targetType: true, targetId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { status, consumerAlert } = parsedBody.data;

  const report = await prisma.$transaction(async (tx) => {
    const updated = await tx.report.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, targetType: true, targetId: true },
    });

    if (existing.targetType === "business" && consumerAlert !== undefined) {
      await tx.business.update({
        where: { id: existing.targetId },
        data: { consumerAlert: consumerAlert && consumerAlert.trim().length > 0 ? consumerAlert.trim() : null },
      });
    }

    return updated;
  });

  return NextResponse.json(report);
}
