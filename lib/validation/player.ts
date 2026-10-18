// lib/validation/player.ts
import { z } from "zod";

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(min).max(max).optional()
  );

export const playerSchema = z
  .object({
    person_id: z.coerce.number().int().positive("Select a person"),
    career_start_year: optionalInt(1850, 2100),
    retired_year: optionalInt(1850, 2100),
    height_cm: optionalInt(120, 230),
    legacy_summary: z.string().trim().max(2000).optional(),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .refine(
    (d) => !d.retired_year || !d.career_start_year || d.retired_year >= d.career_start_year,
    { path: ["retired_year"], message: "Retired year must be on or after the career start year." }
  );