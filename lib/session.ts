import { getIronSession, type IronSessionData } from "iron-session";
import { cookies } from "next/headers";

// T-02-04: iron-session's sealed (encrypted + integrity-checked) cookie —
// a tampered cookie fails to decrypt rather than decoding into
// attacker-controlled session data. Per D-04, this is the ONLY session
// mechanism in the app: a sealed httpOnly cookie, never a client-stored
// JWT in localStorage. Do not add any client-side token storage anywhere
// in this phase.
declare module "iron-session" {
  interface IronSessionData {
    userId?: string;
    phone?: string;
  }
}

export async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: "lankareview_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    },
  });
}
