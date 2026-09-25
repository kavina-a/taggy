import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createReportSchema } from "@/lib/validation/report.schema";
import { toReporterConfirmation } from "@/lib/reports/reporter-response";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";

const REPORT_LIMIT = { max: 10, windowMs: 60 * 60 * 1000 };

// MOD-02: one-tap report. Confirmation only — never status/outcome/id.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`report:${session.userId}`, REPORT_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsedBody = createReportSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { targetType, targetId, reason } = parsedBody.data;

  const exists = await targetExists(targetType, targetId);
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.report.upsert({
    where: {
      userId_targetType_targetId: {
        userId: session.userId,
        targetType,
        targetId,
      },
    },
    create: {
      userId: session.userId,
      targetType,
      targetId,
      reason,
    },
    update: { reason },
  });

  return NextResponse.json(toReporterConfirmation());
}

async function targetExists(
  targetType: "review" | "photo" | "business",
  targetId: string,
): Promise<boolean> {
  if (targetType === "review") {
    const row = await prisma.review.findUnique({ where: { id: targetId }, select: { id: true } });
    return Boolean(row);
  }
  if (targetType === "business") {
    const row = await prisma.business.findUnique({ where: { id: targetId }, select: { id: true } });
    return Boolean(row);
  }
  const [reviewPhoto, businessPhoto] = await Promise.all([
    prisma.reviewPhoto.findUnique({ where: { id: targetId }, select: { id: true } }),
    prisma.businessPhoto.findUnique({ where: { id: targetId }, select: { id: true } }),
  ]);
  return Boolean(reviewPhoto || businessPhoto);
}
