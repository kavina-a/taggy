import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  session.destroy();

  // T-02-09 / must_have: logging out must "immediately return the user to
  // full, unrestricted guest browsing" — a plain <form method="post"> header
  // logout control (no client JS) submits as
  // application/x-www-form-urlencoded and the browser navigates to whatever
  // this route returns, so a bare JSON body would strand the user on a raw
  // JSON page instead of guest browsing. Redirect that submission back home;
  // a JS `fetch` caller (any other content-type) gets the plan's literal
  // `{ ok: true }` JSON contract.
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  }

  return NextResponse.json({ ok: true });
}
