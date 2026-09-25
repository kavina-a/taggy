import { NextRequest, NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendClaimOtpSchema } from "@/lib/validation/create-listing.schema";
import { generateOtpCode, hashOtpCode, OTP_EXPIRY_MS } from "@/lib/otp/generate";
import { ConsoleOtpTransport } from "@/lib/otp/transport";
import { OTP_PURPOSE_CLAIM } from "@/lib/otp/purpose";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";

const SEND_LIMIT = { max: 3, windowMs: 60_000 };
const transport = new ConsoleOtpTransport();

// CLAIM-01 create-new-listing: OTP to the phone the owner is about to list.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = sendClaimOtpSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsedPhone = parsePhoneNumberFromString(parsedBody.data.phone, "LK");
  if (!parsedPhone?.isValid()) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  const phone = parsedPhone.number;

  const allowed = await checkRateLimit(`claim-create-send:${session.userId}`, SEND_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const code = generateOtpCode();
  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      purpose: OTP_PURPOSE_CLAIM,
    },
  });
  await transport.send(phone, code);

  const body: { ok: true; phone: string; devCode?: string } = { ok: true, phone };
  if (process.env.NODE_ENV !== "production") {
    body.devCode = code;
  }
  return NextResponse.json(body);
}
