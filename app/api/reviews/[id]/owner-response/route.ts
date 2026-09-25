import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ownerResponseSchema } from "@/lib/validation/owner-response.schema";
import { classifyContent } from "@/lib/moderation/classify-content";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// VOTE-02: claimed owner posts exactly one public response per review.
export async function POST(req: NextRequest, { params }: RouteParams) {
  return upsertOwnerResponse(req, params, "create");
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return upsertOwnerResponse(req, params, "update");
}

async function upsertOwnerResponse(
  req: NextRequest,
  params: Promise<{ id: string }>,
  mode: "create" | "update",
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: reviewId } = await params;
  const parsedBody = ownerResponseSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { text } = parsedBody.data;

  const moderation = classifyContent(text);
  if (moderation.blocked) {
    return NextResponse.json(
      { error: "Your response could not be published.", reasons: moderation.reasons },
      { status: 400 },
    );
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      businessId: true,
      business: { select: { claimedByUserId: true } },
    },
  });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (review.business.claimedByUserId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (mode === "create") {
    try {
      const created = await prisma.ownerResponse.create({
        data: {
          reviewId,
          businessId: review.businessId,
          userId: session.userId,
          text,
        },
      });
      return NextResponse.json(
        {
          id: created.id,
          text: created.text,
          createdAt: created.createdAt,
          editedAt: created.editedAt,
        },
        { status: 201 },
      );
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json(
          { error: "This review already has an owner response." },
          { status: 409 },
        );
      }
      throw err;
    }
  }

  const existing = await prisma.ownerResponse.findUnique({ where: { reviewId } });
  if (!existing) {
    return NextResponse.json({ error: "Owner response not found" }, { status: 404 });
  }

  const updated = await prisma.ownerResponse.update({
    where: { reviewId },
    data: { text, editedAt: new Date() },
  });
  return NextResponse.json({
    id: updated.id,
    text: updated.text,
    createdAt: updated.createdAt,
    editedAt: updated.editedAt,
  });
}
