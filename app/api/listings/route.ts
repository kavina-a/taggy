import { NextRequest, NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createListingSchema } from "@/lib/validation/create-listing.schema";
import { verifyOtpChallenge } from "@/lib/otp/verify";
import { OTP_PURPOSE_CLAIM } from "@/lib/otp/purpose";
import { slugifyBusinessName } from "@/lib/businesses/slugify";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = createListingSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const input = parsedBody.data;

  const parsedPhone = parsePhoneNumberFromString(input.phone, "LK");
  if (!parsedPhone?.isValid()) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  const phone = parsedPhone.number;

  const otp = await verifyOtpChallenge(phone, input.code, OTP_PURPOSE_CLAIM);
  if (!otp.ok) {
    return NextResponse.json(
      { error: "That code didn't work. Check it and try again." },
      { status: 400 },
    );
  }

  const baseSlug = slugifyBusinessName(input.name);
  let slug = baseSlug;
  for (let i = 0; i < 8; i += 1) {
    const clash = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const created = await prisma.business.create({
    data: {
      slug,
      name: input.name,
      description: input.description,
      primaryCategories: input.primaryCategories,
      secondaryCategories: input.secondaryCategories,
      district: input.district,
      addressFreeText: input.addressFreeText,
      latitude: input.latitude,
      longitude: input.longitude,
      phone,
      claimedByUserId: session.userId,
      claimedAt: new Date(),
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(created, { status: 201 });
}
