import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";
import { ingestUploadedPhoto } from "@/lib/uploads/ingest-photo";
import { photoCaptionSchema } from "@/lib/validation/photo-upload.schema";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const UPLOAD_LIMIT = { max: 10, windowMs: 60_000 };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`photo:${session.userId}`, UPLOAD_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A photo file is required." }, { status: 400 });
  }

  const captionRaw = form.get("caption");
  const captionParsed = photoCaptionSchema.safeParse(
    typeof captionRaw === "string" && captionRaw.length > 0 ? captionRaw : undefined,
  );
  if (!captionParsed.success) {
    return NextResponse.json({ error: "Invalid caption" }, { status: 400 });
  }
  const caption = captionParsed.data ?? null;

  const ingested = await ingestUploadedPhoto(file, caption);
  if (!ingested.ok) {
    return NextResponse.json(
      { error: ingested.error, reasons: ingested.reasons },
      { status: ingested.status },
    );
  }

  const maxSort = await prisma.businessPhoto.aggregate({
    where: { businessId: business.id },
    _max: { sortOrder: true },
  });

  const photo = await prisma.businessPhoto.create({
    data: {
      businessId: business.id,
      url: ingested.url,
      caption,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      isMenuPhoto: false,
      uploadedByUserId: session.userId,
    },
    select: { id: true, url: true, caption: true, sortOrder: true, isMenuPhoto: true },
  });

  return NextResponse.json(photo, { status: 201 });
}
