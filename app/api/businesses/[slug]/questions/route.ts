import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";
import { classifyContent } from "@/lib/moderation/classify-content";
import { createQuestionSchema } from "@/lib/validation/question.schema";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const QUESTION_LIMIT = { max: 10, windowMs: 60_000 };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`question:${session.userId}`, QUESTION_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = createQuestionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const moderation = classifyContent(parsed.data.text);
  if (moderation.blocked) {
    return NextResponse.json(
      { error: "This question couldn't be published.", reasons: moderation.reasons },
      { status: 422 },
    );
  }

  const question = await prisma.question.create({
    data: {
      businessId: business.id,
      userId: session.userId,
      text: parsed.data.text,
    },
    select: { id: true, text: true, createdAt: true },
  });

  return NextResponse.json(
    { ...question, createdAt: question.createdAt.toISOString() },
    { status: 201 },
  );
}
