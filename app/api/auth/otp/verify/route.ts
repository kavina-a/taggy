import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/otp/otp.schema";
import { verifyOtpChallenge } from "@/lib/otp/verify";
import { getSession } from "@/lib/session";

const VALID_LANG_PREFS = new Set(["en", "si", "ta"]);

export async function POST(req: NextRequest) {
  const parsedBody = verifyOtpSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { phone, code } = parsedBody.data;

  const result = await verifyOtpChallenge(phone, code);
  if (!result.ok) {
    return NextResponse.json(
      { error: "That code didn't work. Check it and try again." },
      { status: 400 },
    );
  }

  // Pattern 6: copy a guest's already-set cookie language preference onto
  // the new User row once at signup time, so the choice isn't lost. Only
  // applies on `create` — never overwrites an existing user's preference
  // on `update`.
  const guestLangPref = (await cookies()).get("lang_pref")?.value;
  const languagePref =
    guestLangPref && VALID_LANG_PREFS.has(guestLangPref) ? guestLangPref : "en";

  const user = await prisma.user.upsert({
    where: { phone },
    create: { phone, languagePref },
    update: {},
  });

  const session = await getSession();
  session.userId = user.id;
  session.phone = user.phone;
  await session.save();

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      hasSeenProfilePrompt: user.hasSeenProfilePrompt,
    },
  });
}
