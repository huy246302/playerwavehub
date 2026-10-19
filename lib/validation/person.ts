import { z } from "zod";

const optDate = z.preprocess((v) => (v === "" ? undefined : v), z.string().date().optional());
const optText = z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(2000).optional());

export const personSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter the full name").max(200),
    display_name: optText,
    date_of_birth: optDate,
    date_of_death: optDate,
    birthplace: optText,
    bio: optText,
  })
  .refine((d) => !d.date_of_birth || !d.date_of_death || d.date_of_death >= d.date_of_birth, {
    path: ["date_of_death"],
    message: "Death date must be on or after the birth date.",
  });