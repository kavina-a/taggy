import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";
import { ingestUploadedPhoto } from "@/lib/uploads/ingest-photo";

const UPLOAD_LIMIT = { max: 10, windowMs: 60_000 };

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`upload:${session.userId}`, UPLOAD_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

  const ingested = await ingestUploadedPhoto(file);
  if (!ingested.ok) {
    return NextResponse.json(
      { error: ingested.error, reasons: ingested.reasons },
      { status: ingested.status },
    );
  }

  return NextResponse.json({ url: ingested.url }, { status: 201 });
}
