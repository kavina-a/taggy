import { NextRequest, NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { prisma } from "@/lib/prisma";
import { sendOtpSchema } from "@/lib/otp/otp.schema";
import { generateOtpCode, hashOtpCode, OTP_EXPIRY_MS } from "@/lib/otp/generate";
import { ConsoleOtpTransport } from "@/lib/otp/transport";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";

// T-02-03: rate limits are enforced before any OtpChallenge row is created
// or transport.send is called — never after.
const SEND_LIMIT_PER_PHONE = { max: 3, windowMs: 60_000 };
const SEND_LIMIT_PER_IP = { max: 10, windowMs: 60_000 };

const transport = new ConsoleOtpTransport(); // D-03: dev-mode stub only

export async function POST(req: NextRequest) {
  const parsedBody = sendOtpSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsedPhone = parsePhoneNumberFromString(parsedBody.data.phone, "LK");
  if (!parsedPhone?.isValid()) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  const phone = parsedPhone.number; // E.164 normalized, e.g. +947XXXXXXXX

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowedByPhone = await checkRateLimit(`otp-send:${phone}`, SEND_LIMIT_PER_PHONE);
  const allowedByIp = await checkRateLimit(`otp-send-ip:${ip}`, SEND_LIMIT_PER_IP);
  if (!allowedByPhone || !allowedByIp) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // T-02-05: this route never queries or branches on User existence — the
  // response shape and status code below are identical whether `phone`
  // belongs to an existing User or not. That distinction only happens in
  // the verify route, after successful code entry.
  const code = generateOtpCode();
  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });
  await transport.send(phone, code);

  // T-02-07: devCode is strictly gated behind NODE_ENV !== "production" —
  // it must never appear in a production response body.
  const body: { ok: true; devCode?: string } = { ok: true };
  if (process.env.NODE_ENV !== "production") {
    body.devCode = code;
  }

  return NextResponse.json(body);
}
