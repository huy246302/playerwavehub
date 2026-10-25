import { z } from "zod";
import { optInt, optText } from "@/lib/validation/common";

export const playerSchema = z
  .object({
    biography_id: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(v)),
      z.number().int().positive({ message: "Select a biography." })
    ),
    career_start_year: optInt(1850, 2100),
    retired_year: optInt(1850, 2100),
    height_cm: optInt(120, 230),
    legacy_summary: optText(),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .superRefine((d, ctx) => {
    if (d.career_start_year && d.retired_year && d.retired_year < d.career_start_year) {
      ctx.addIssue({ code: "custom", path: ["retired_year"], message: "Retired year must be on or after the career start year." });
    }
  });

export type PlayerInput = z.infer<typeof playerSchema>;