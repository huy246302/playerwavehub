import { z } from "zod";
import { optText, optUrl, optInt } from "@/lib/validation/common";

export const clubSchema = z.object({
  name: z.string().trim().min(2, "Enter the club name.").max(200),
  short_name: optText(50),
  city: optText(120),
  country_id: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().positive().optional()
  ),
  founded_year: optInt(1850, 2100),
  logo_url: optUrl,
  logo_credit: optText(200),
  logo_license: optText(100),
  logo_source_url: optUrl,
  description: optText(4000),
});

export type ClubInput = z.infer<typeof clubSchema>;