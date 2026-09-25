import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyClaimSchema } from "@/lib/validation/claim.schema";
import { verifyOtpChallenge } from "@/lib/otp/verify";
import { OTP_PURPOSE_CLAIM } from "@/lib/otp/purpose";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = verifyClaimSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

  const result = await verifyOtpChallenge(business.phone, parsedBody.data.code, OTP_PURPOSE_CLAIM);
  if (!result.ok) {
    return NextResponse.json(
      { error: "That code didn't work. Check it and try again." },
      { status: 400 },
    );
  }

  const claimed = await prisma.business.updateMany({
    where: { id: business.id, claimedByUserId: null },
    data: { claimedByUserId: session.userId, claimedAt: new Date() },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ error: "This listing is already claimed." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
