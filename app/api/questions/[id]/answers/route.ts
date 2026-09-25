import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";
import { classifyContent } from "@/lib/moderation/classify-content";
import { createAnswerSchema } from "@/lib/validation/question.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ANSWER_LIMIT = { max: 20, windowMs: 60_000 };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`answer:${session.userId}`, ANSWER_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id: questionId } = await params;
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = createAnswerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const moderation = classifyContent(parsed.data.text);
  if (moderation.blocked) {
    return NextResponse.json(
      { error: "This answer couldn't be published.", reasons: moderation.reasons },
      { status: 422 },
    );
  }

  const answer = await prisma.answer.create({
    data: {
      questionId,
      userId: session.userId,
      text: parsed.data.text,
    },
    select: { id: true, text: true, voteCount: true, createdAt: true },
  });

  return NextResponse.json(
    { ...answer, createdAt: answer.createdAt.toISOString() },
    { status: 201 },
  );
}
