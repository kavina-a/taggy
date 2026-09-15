import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const languageSchema = z
  .object({
    lang: z.enum(["en", "si", "ta"]),
  })
  .strict();

export async function POST(req: NextRequest) {
  const parsedBody = languageSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // T-02-12: userId comes only from the server-verified session cookie,
  // never a client-supplied id, so a caller can only update their own row.
  const session = await getSession();
  if (session.userId) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { languagePref: parsedBody.data.lang },
    });
  }
  // A guest should never reach this route (LanguageSwitcher branches to the
  // cookie-only path client-side), but treat it as a no-op rather than an
  // error if it does — the guest's preference already lives in their cookie.

  return NextResponse.json({ ok: true });
}
