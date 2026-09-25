import { describe, expect, it } from "vitest";
import { photoUrlSchema } from "./photo-upload.schema";

describe("photoUrlSchema", () => {
  it("accepts same-origin uploaded files", () => {
    expect(photoUrlSchema.parse("/uploads/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg")).toBe(
      "/uploads/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg",
    );
  });

  it("accepts https URLs and rejects http or junk", () => {
    expect(photoUrlSchema.parse("https://picsum.photos/seed/x/800/600")).toContain("https://");
    expect(photoUrlSchema.safeParse("http://evil.example/x.jpg").success).toBe(false);
    expect(photoUrlSchema.safeParse("not-a-url").success).toBe(false);
  });
});
