import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toggleVoteSchema } from "@/lib/validation/vote.schema";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VOTE_LIMIT = { max: 60, windowMs: 60_000 };

function countField(kind: "useful" | "funny" | "cool"): "usefulCount" | "funnyCount" | "coolCount" {
  if (kind === "useful") return "usefulCount";
  if (kind === "funny") return "funnyCount";
  return "coolCount";
}

// VOTE-01: independent toggles. Anyone logged in can vote — no review-history
// gate. Authors cannot vote on their own review.
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`vote:${session.userId}`, VOTE_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id: reviewId } = await params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsedBody = toggleVoteSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { kind } = parsedBody.data;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, usefulCount: true, funnyCount: true, coolCount: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (review.userId === session.userId) {
    return NextResponse.json({ error: "You can't vote on your own review." }, { status: 403 });
  }

  const field = countField(kind);

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.reviewVote.findUnique({
      where: {
        reviewId_userId_kind: { reviewId, userId: session.userId!, kind },
      },
    });

    if (existing) {
      await tx.reviewVote.delete({ where: { id: existing.id } });
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: { [field]: { decrement: 1 } },
        select: { usefulCount: true, funnyCount: true, coolCount: true },
      });
      return { voted: false as const, counts: updated };
    }

    try {
      await tx.reviewVote.create({
        data: { reviewId, userId: session.userId!, kind },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const updated = await tx.review.findUniqueOrThrow({
          where: { id: reviewId },
          select: { usefulCount: true, funnyCount: true, coolCount: true },
        });
        return { voted: true as const, counts: updated };
      }
      throw err;
    }

    const updated = await tx.review.update({
      where: { id: reviewId },
      data: { [field]: { increment: 1 } },
      select: { usefulCount: true, funnyCount: true, coolCount: true },
    });
    return { voted: true as const, counts: updated };
  });

  return NextResponse.json({
    kind,
    voted: result.voted,
    counts: {
      useful: result.counts.usefulCount,
      funny: result.counts.funnyCount,
      cool: result.counts.coolCount,
    },
  });
}
