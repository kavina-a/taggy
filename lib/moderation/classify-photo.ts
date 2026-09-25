import { classifyContent } from "@/lib/moderation/classify-content";
import { scanNsfwPixels } from "@/lib/moderation/scan-nsfw-pixels";

// PHOTO-02: automated moderation that runs BEFORE a community or review
// photo goes live. Bootstrap-budget: no paid NSFW model. File validity +
// size/geometry + caption/filename lexical checks + a pixel skin-tone scan
// (scanNsfwPixels). A `blocked: true` result rejects the upload and the
// reasons ARE shown to the uploader — same contract as classifyContent()
// for review text (MOD-01).

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MIN_PHOTO_EDGE = 200;
export const MAX_PHOTO_ASPECT = 4;

export type PhotoFormat = "jpeg" | "png" | "webp";

export interface ClassifyPhotoInput {
  bytes: Buffer;
  filename?: string;
  caption?: string | null;
}

export interface ClassifyPhotoResult {
  blocked: boolean;
  reasons: string[];
  format: PhotoFormat | null;
  width: number | null;
  height: number | null;
}

const NSFW_TERMS = [
  "porn",
  "porno",
  "xxx",
  "nsfw",
  "nude",
  "nudes",
  "naked",
  "sex",
  "sexual",
  "erotic",
  "onlyfans",
];

const NSFW_REGEX = new RegExp(`\\b(${NSFW_TERMS.join("|")})`, "i");

const IRRELEVANT_CAPTION_REGEX =
  /\b(click here|buy now|subscribe|follow me|visit my (site|website)|promo code)\b|https?:\/\/|www\./i;

export function sniffPhotoFormat(bytes: Buffer): PhotoFormat | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  const riff = bytes.subarray(0, 4).toString("ascii");
  const webp = bytes.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") return "webp";
  return null;
}

export function readPhotoDimensions(
  bytes: Buffer,
  format: PhotoFormat,
): { width: number; height: number } | null {
  if (format === "png") return readPngDimensions(bytes);
  if (format === "jpeg") return readJpegDimensions(bytes);
  if (format === "webp") return readWebpDimensions(bytes);
  return null;
}

function readPngDimensions(bytes: Buffer): { width: number; height: number } | null {
  // IHDR is the first chunk: 8-byte signature + 4 length + 4 "IHDR" + 4w + 4h
  if (bytes.length < 24) return null;
  if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") return null;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width < 1 || height < 1) return null;
  return { width, height };
}

function readJpegDimensions(bytes: Buffer): { width: number; height: number } | null {
  // Walk SOF0/SOF2 markers (0xC0 / 0xC2).
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      const height = bytes.readUInt16BE(i + 5);
      const width = bytes.readUInt16BE(i + 7);
      if (width < 1 || height < 1) return null;
      return { width, height };
    }
    const length = bytes.readUInt16BE(i + 2);
    if (length < 2) return null;
    i += 2 + length;
  }
  return null;
}

function readWebpDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 30) return null;
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") {
    // 24-bit width-1 / height-1 little-endian starting at offset 24.
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    if (width < 1 || height < 1) return null;
    return { width, height };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    // Lossy VP8 bitstream: 16-bit width/height at offset 26, 14 bits used.
    const width = bytes.readUInt16LE(26) & 0x3fff;
    const height = bytes.readUInt16LE(28) & 0x3fff;
    if (width < 1 || height < 1) return null;
    return { width, height };
  }
  return null;
}

export async function classifyPhoto(input: ClassifyPhotoInput): Promise<ClassifyPhotoResult> {
  const reasons: string[] = [];
  const format = sniffPhotoFormat(input.bytes);
  let width: number | null = null;
  let height: number | null = null;

  if (!format) {
    reasons.push("invalid_image");
    return { blocked: true, reasons, format: null, width, height };
  }

  if (input.bytes.length > MAX_PHOTO_BYTES) {
    reasons.push("too_large");
  }

  const dims = readPhotoDimensions(input.bytes, format);
  if (!dims) {
    reasons.push("invalid_image");
  } else {
    width = dims.width;
    height = dims.height;
    if (dims.width < MIN_PHOTO_EDGE || dims.height < MIN_PHOTO_EDGE) {
      reasons.push("too_small");
    }
    const aspect =
      dims.width >= dims.height
        ? dims.width / dims.height
        : dims.height / dims.width;
    if (aspect > MAX_PHOTO_ASPECT) {
      reasons.push("irrelevant_geometry");
    }
  }

  const caption = input.caption?.trim() ?? "";
  const filename = input.filename ?? "";
  const lexical = `${caption} ${filename}`;

  if (NSFW_REGEX.test(lexical)) {
    reasons.push("nsfw");
  }

  if (caption) {
    const textModeration = classifyContent(caption);
    if (textModeration.blocked) {
      reasons.push(...textModeration.reasons);
    }
    if (IRRELEVANT_CAPTION_REGEX.test(caption)) {
      reasons.push("irrelevant_caption");
    }
  }

  // Pixel look — skipped only when the file isn't a decodable image.
  if (!reasons.includes("invalid_image")) {
    const visual = await scanNsfwPixels(input.bytes);
    if (visual.flagged) {
      reasons.push("nsfw_visual");
    }
  }

  return {
    blocked: reasons.length > 0,
    reasons: [...new Set(reasons)],
    format,
    width,
    height,
  };
}
