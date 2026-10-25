import { z } from "zod";
import { blank, optInt, toNumber } from "@/lib/validation/common";

const CURRENT_YEAR = new Date().getFullYear();
const optYear = optInt(1800, CURRENT_YEAR);
const optCount = optInt(0, 9999);
const optDate = z.preprocess(blank, z.string().date().optional());

export const clubStintSchema = z
  .object({
    club_id: z.preprocess(toNumber, z.number().int().positive({ message: "Select a club." })),
    start_year: z.preprocess(toNumber, z.number({ message: "Enter the start year." }).int().min(1800).max(CURRENT_YEAR)),
    end_year: optYear,
    is_loan: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
    appearances: optCount,
    goals: optCount,
  })
  .refine((d) => !d.end_year || d.end_year >= d.start_year, {
    path: ["end_year"],
    message: "End year must be on or after the start year.",
  });
export type ClubStintInput = z.infer<typeof clubStintSchema>;

export const nationalStintSchema = z
  .object({
    national_team_id: z.preprocess(toNumber, z.number().int().positive({ message: "Select a national team." })),
    debut_date: optDate,
    last_cap_date: optDate,
    caps: optCount,
    goals: optCount,
  })
  .refine((d) => !d.debut_date || !d.last_cap_date || d.last_cap_date >= d.debut_date, {
    path: ["last_cap_date"],
    message: "Last cap date must be on or after the debut date.",
  });
export type NationalStintInput = z.infer<typeof nationalStintSchema>;