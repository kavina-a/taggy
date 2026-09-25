import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateOtpCode, hashOtpCode, OTP_EXPIRY_MS } from "@/lib/otp/generate";
import { ConsoleOtpTransport } from "@/lib/otp/transport";
import { OTP_PURPOSE_CLAIM } from "@/lib/otp/purpose";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const SEND_LIMIT = { max: 3, windowMs: 60_000 };
const transport = new ConsoleOtpTransport();

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, phone: true, claimedByUserId: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }
  if (business.claimedByUserId) {
    return NextResponse.json({ error: "This listing is already claimed." }, { status: 409 });
  }
  if (!business.phone) {
    return NextResponse.json(
      { error: "This listing has no phone number to verify." },
      { status: 400 },
    );
  }

  const allowed = await checkRateLimit(`claim-send:${session.userId}`, SEND_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const code = generateOtpCode();
  await prisma.otpChallenge.create({
    data: {
      phone: business.phone,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      purpose: OTP_PURPOSE_CLAIM,
    },
  });
  await transport.send(business.phone, code);

  const body: { ok: true; devCode?: string } = { ok: true };
  if (process.env.NODE_ENV !== "production") {
    body.devCode = code;
  }
  return NextResponse.json(body);
}
