import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { PhotoFormat } from "@/lib/moderation/classify-photo";

const EXT: Record<PhotoFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export function uploadsDir(): string {
  return path.join(process.cwd(), "public", "uploads");
}

export function publicUploadPath(filename: string): string {
  return `/uploads/${filename}`;
}

export async function storePhotoBytes(
  bytes: Buffer,
  format: PhotoFormat,
): Promise<{ filename: string; url: string }> {
  const filename = `${randomUUID().replace(/-/g, "")}.${EXT[format]}`;
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return { filename, url: publicUploadPath(filename) };
}
