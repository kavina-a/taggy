import { z } from "zod";

export const photoCaptionSchema = z.string().max(200).optional();

export const photoUrlSchema = z
  .string()
  .refine(
    (value) => {
      if (/^\/uploads\/[a-f0-9]{32}\.(jpg|png|webp)$/i.test(value)) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Invalid photo URL" },
  );
