import { z } from "zod";

const optInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(min).max(max).optional()
  );
const optText = (max = 2000) =>
  z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(max).optional());
const optDate = z.preprocess((v) => (v === "" ? undefined : v), z.string().date().optional());

export const playerSchema = z
  .object({
    person_mode: z.enum(["new", "existing"]).default("existing"),
    biography_id: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(v)),
      z.number().int().positive().optional()
    ),
    // new-person fields
    full_name: optText(200),
    display_name: optText(200),
    date_of_birth: optDate,
    date_of_death: optDate,
    birthplace: optText(200),
    // player fields
    career_start_year: optInt(1850, 2100),
    retired_year: optInt(1850, 2100),
    height_cm: optInt(120, 230),
    legacy_summary: optText(),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .superRefine((d, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (d.person_mode === "existing" && !d.biography_id) issue("biography_id", "Select a person.");
    if (d.person_mode === "new") {
      if (!d.full_name || d.full_name.length < 2) issue("full_name", "Enter the full name.");
      if (d.date_of_birth && d.date_of_death && d.date_of_death < d.date_of_birth)
        issue("date_of_death", "Death date must be on or after the birth date.");
    }
    if (d.career_start_year && d.retired_year && d.retired_year < d.career_start_year)
      issue("retired_year", "Retired year must be on or after the career start year.");
  });

export type PlayerInput = z.infer<typeof playerSchema>;