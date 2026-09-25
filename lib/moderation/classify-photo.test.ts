import { describe, expect, it } from "vitest";
import { classifyPhoto, sniffPhotoFormat } from "./classify-photo";
import { makePng } from "./make-png";

describe("classifyPhoto", () => {
  it("accepts a large-enough clean PNG with an optional clean caption", async () => {
    const bytes = makePng(400, 300);
    const result = await classifyPhoto({ bytes, caption: "Front of the restaurant at dusk" });
    expect(result.blocked).toBe(false);
    expect(result.reasons).toEqual([]);
    expect(result.format).toBe("png");
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
  });

  it("blocks a file that is not a jpeg/png/webp", async () => {
    const result = await classifyPhoto({ bytes: Buffer.from("not an image") });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("invalid_image");
    expect(result.format).toBeNull();
  });

  it("blocks images smaller than 200px on either edge as too_small (spam/icon)", async () => {
    const result = await classifyPhoto({ bytes: makePng(64, 64) });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("too_small");
  });

  it("blocks extreme aspect ratios as irrelevant_geometry", async () => {
    const result = await classifyPhoto({ bytes: makePng(1200, 80) });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("irrelevant_geometry");
  });

  it("blocks NSFW terms in the caption", async () => {
    const result = await classifyPhoto({
      bytes: makePng(400, 300),
      caption: "nsfw photo from last night",
    });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("nsfw");
  });

  it("blocks promotional captions as irrelevant_caption", async () => {
    const result = await classifyPhoto({
      bytes: makePng(400, 300),
      caption: "Click here to visit my website for deals",
    });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("irrelevant_caption");
  });

  it("runs MOD-01 classifyContent on the caption (profanity)", async () => {
    const result = await classifyPhoto({
      bytes: makePng(400, 300),
      caption: "This place is fucking packed on Fridays",
    });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("profanity");
  });

  it("blocks a near-uniform skin-tone image as nsfw_visual", async () => {
    const result = await classifyPhoto({
      bytes: makePng(400, 300, [220, 160, 130]),
    });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("nsfw_visual");
  });

  it("sniffs PNG and JPEG magic bytes", () => {
    expect(sniffPhotoFormat(makePng(200, 200))).toBe("png");
    const jpegHeader = Buffer.alloc(12, 0);
    jpegHeader[0] = 0xff;
    jpegHeader[1] = 0xd8;
    jpegHeader[2] = 0xff;
    jpegHeader[3] = 0xe0;
    expect(sniffPhotoFormat(jpegHeader)).toBe("jpeg");
  });
});
