import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VOTE_LIMIT = { max: 60, windowMs: 60_000 };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`answer-vote:${session.userId}`, VOTE_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id: answerId } = await params;
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: { id: true, userId: true, voteCount: true },
  });
  if (!answer) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 });
  }
  if (answer.userId === session.userId) {
    return NextResponse.json({ error: "You can't vote on your own answer." }, { status: 403 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.answerVote.findUnique({
      where: { answerId_userId: { answerId, userId: session.userId! } },
    });

    if (existing) {
      await tx.answerVote.delete({ where: { id: existing.id } });
      const updated = await tx.answer.update({
        where: { id: answerId },
        data: { voteCount: { decrement: 1 } },
        select: { voteCount: true },
      });
      return { voted: false as const, voteCount: updated.voteCount };
    }

    try {
      await tx.answerVote.create({
        data: { answerId, userId: session.userId! },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const updated = await tx.answer.findUniqueOrThrow({
          where: { id: answerId },
          select: { voteCount: true },
        });
        return { voted: true as const, voteCount: updated.voteCount };
      }
      throw err;
    }

    const updated = await tx.answer.update({
      where: { id: answerId },
      data: { voteCount: { increment: 1 } },
      select: { voteCount: true },
    });
    return { voted: true as const, voteCount: updated.voteCount };
  });

  return NextResponse.json(result);
}
