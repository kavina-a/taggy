import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// T-02-12: `userId` is read exclusively from the server-verified, sealed
// session cookie (never a client-supplied body field) before deciding which
// User row to update — a caller can only ever update their own row.
const profileSchema = z
  .object({
    name: z.string().min(1).max(80).nullable(),
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

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: parsedBody.data.name ?? undefined,
      hasSeenProfilePrompt: true,
    },
  });

  return NextResponse.json({ ok: true });
}
