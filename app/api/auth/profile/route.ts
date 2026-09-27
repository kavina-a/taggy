import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const optionalEmail = z
  .string()
  .max(120)
  .refine((value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: "Invalid email",
  })
  .nullable();

const profileSchema = z
  .object({
    name: z.string().min(1).max(80).nullable().optional(),
    email: optionalEmail.optional(),
    city: z.string().max(80).nullable().optional(),
    avatarUrl: z.string().max(500).nullable().optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = profileSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = parsedBody.data.email;
  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: parsedBody.data.name !== undefined ? (parsedBody.data.name ?? null) : undefined,
        email: email === undefined || email === "" ? undefined : email,
        city: parsedBody.data.city !== undefined ? (parsedBody.data.city ?? null) : undefined,
        avatarUrl: parsedBody.data.avatarUrl !== undefined ? (parsedBody.data.avatarUrl ?? null) : undefined,
        hasSeenProfilePrompt: true,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
