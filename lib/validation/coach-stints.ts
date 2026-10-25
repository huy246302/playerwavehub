import { z } from "zod";
import { optInt, toNumber } from "@/lib/validation/common";

const CURRENT_YEAR = new Date().getFullYear();
const optYear = optInt(1800, CURRENT_YEAR);
const optCount = optInt(0, 9999);

const base = {
  start_year: z.preprocess(toNumber, z.number({ message: "Enter the start year." }).int().min(1800).max(CURRENT_YEAR)),
  end_year: optYear,
  is_caretaker: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  matches: optCount,
  wins: optCount,
  draws: optCount,
  losses: optCount,
};

export const coachClubStintSchema = z
  .object({ club_id: z.preprocess(toNumber, z.number().int().positive({ message: "Select a club." })), ...base })
  .refine((d) => !d.end_year || d.end_year >= d.start_year, { path: ["end_year"], message: "End year must be on or after the start year." });
export type CoachClubStintInput = z.infer<typeof coachClubStintSchema>;

export const coachNationalStintSchema = z
  .object({ national_team_id: z.preprocess(toNumber, z.number().int().positive({ message: "Select a national team." })), ...base })
  .refine((d) => !d.end_year || d.end_year >= d.start_year, { path: ["end_year"], message: "End year must be on or after the start year." });
export type CoachNationalStintInput = z.infer<typeof coachNationalStintSchema>;