import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isModeratorPhone } from "@/lib/moderation/is-moderator";

export async function requireModerator(): Promise<
  | { ok: true; userId: string; phone: string }
  | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session.userId || !session.phone) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!isModeratorPhone(session.phone)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }
  return { ok: true, userId: session.userId, phone: session.phone };
}
