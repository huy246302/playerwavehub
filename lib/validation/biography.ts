import { z } from "zod";

const blank = (v: unknown) => (v === "" || v == null ? undefined : v);

const optDate = z.preprocess(blank, z.string().date().optional());
const optShort = z.preprocess(blank, z.string().trim().max(200).optional());
const optLong = z.preprocess(blank, z.string().trim().max(20000).optional());
const optId = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number("Pick a country from the list").int().positive().optional()
);
const optUrl = z.preprocess(
  blank,
  z.string().trim().max(500)
    .refine((u) => /^https?:\/\/\S+$/i.test(u), "Enter a full link starting with https://")
    .optional()
);

export const biographySchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter the full name").max(200),
    display_name: optShort,
    date_of_birth: optDate,
    date_of_death: optDate,
    birthplace: optShort,
    birth_country_id: optId,
    nationality_id: optId,
    bio: optLong,
    photo_url: optUrl,
    photo_credit: optShort,
    photo_license: optShort,
    photo_source_url: optUrl,
  })
  .refine((d) => !d.date_of_birth || !d.date_of_death || d.date_of_death >= d.date_of_birth, {
    path: ["date_of_death"],
    message: "Death date must be on or after the birth date.",
  });