import { z } from "zod";

// "HH:mm" 24-hour wall-clock time, matching BusinessHoursRow/BusinessHoursOverrideRow's
// openTime/closeTime shape (lib/types/business.ts).
const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const hoursRowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: timeOfDaySchema,
  closeTime: timeOfDaySchema,
  crossesMidnight: z.boolean(),
});

export const hoursOverrideRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isClosed: z.boolean(),
  openTime: timeOfDaySchema.nullable(),
  closeTime: timeOfDaySchema.nullable(),
  crossesMidnight: z.boolean(),
});

export type HoursRowInput = z.infer<typeof hoursRowSchema>;
export type HoursOverrideRowInput = z.infer<typeof hoursOverrideRowSchema>;
