import sharp from "sharp";

// Bootstrap visual NSFW gate (PHOTO-02). No paid classifier: decode pixels
// with sharp, then flag near-uniform skin-heavy frames. Tight HSV bounds
// plus an edge check so textured food close-ups are less likely to trip it
// than a mostly-skin still. This is a real pixel look, not a caption check.

export const NSFW_SKIN_RATIO = 0.48;
export const NSFW_HIGH_SKIN_RATIO = 0.72;
export const NSFW_MAX_EDGE_RATIO = 0.18;

export interface NsfwScanResult {
  flagged: boolean;
  skinRatio: number;
  edgeRatio: number;
}

function isSkinTone(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60;
    else if (max === gg) h = ((bb - rr) / d + 2) * 60;
    else h = ((rr - gg) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  const hueOk = h <= 50 || h >= 340;
  return hueOk && s >= 0.15 && s <= 0.68 && v >= 0.35 && v <= 0.95 && r > g && r > b;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export async function scanNsfwPixels(bytes: Buffer): Promise<NsfwScanResult> {
  try {
    const { data, info } = await sharp(bytes)
      .resize(64, 64, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const pixels = width * height;
    if (pixels === 0) return { flagged: false, skinRatio: 0, edgeRatio: 0 };

    let skin = 0;
    let edges = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 3;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (isSkinTone(r, g, b)) skin += 1;
        if (x + 1 < width) {
          const j = (y * width + x + 1) * 3;
          if (Math.abs(luminance(r, g, b) - luminance(data[j], data[j + 1], data[j + 2])) > 25) {
            edges += 1;
          }
        }
      }
    }

    const skinRatio = skin / pixels;
    const edgeRatio = edges / pixels;
    const flagged =
      skinRatio >= NSFW_HIGH_SKIN_RATIO ||
      (skinRatio >= NSFW_SKIN_RATIO && edgeRatio < NSFW_MAX_EDGE_RATIO);

    return { flagged, skinRatio, edgeRatio };
  } catch {
    return { flagged: false, skinRatio: 0, edgeRatio: 0 };
  }
}
