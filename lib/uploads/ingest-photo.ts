import { classifyPhoto } from "@/lib/moderation/classify-photo";
import { storePhotoBytes } from "@/lib/uploads/store-photo";

export type IngestPhotoResult =
  | { ok: true; url: string }
  | { ok: false; status: 400 | 422; error: string; reasons?: string[] };

export async function ingestUploadedPhoto(
  file: File,
  caption?: string | null,
): Promise<IngestPhotoResult> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const moderation = await classifyPhoto({
    bytes,
    filename: file.name,
    caption,
  });
  if (moderation.blocked || !moderation.format) {
    return {
      ok: false,
      status: 422,
      error: "This photo couldn't be published.",
      reasons: moderation.reasons,
    };
  }

  const stored = await storePhotoBytes(bytes, moderation.format);
  return { ok: true, url: stored.url };
}
