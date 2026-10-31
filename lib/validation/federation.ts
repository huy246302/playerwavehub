import { z } from "zod";
import { blank, optText, optUrl, optInt, toNumber } from "@/lib/validation/common";

export const CONFEDERATIONS = ["AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"] as const;

export const federationSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the federation name.").max(200),
    short_name: optText(50),
    country_id: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(v)),
      z.number({ error: "Select the country." }).int().positive("Select the country.")
    ),
    confederation: z.preprocess(
      blank,
      z.enum(CONFEDERATIONS, { error: "Choose a confederation from the list." }).optional()
    ),
    founded_year: z.preprocess(
      toNumber,
      z.number({ error: "Enter the founded year." })
        .int("Enter a four-digit year.")
        .min(1800, "Enter a four-digit year.")
    ),
    ended_year: optInt(1800, 9999),
    logo_url: optUrl,
    logo_credit: optText(200),
    logo_license: optText(100),
    logo_source_url: optUrl,
    description: optText(4000),
  })
  .superRefine((d, ctx) => {
    const thisYear = new Date().getFullYear();
    if (d.founded_year > thisYear) {
      ctx.addIssue({ code: "custom", path: ["founded_year"], message: `The founded year can't be after ${thisYear}.` });
    }
    if (d.ended_year != null && d.ended_year > thisYear) {
      ctx.addIssue({ code: "custom", path: ["ended_year"], message: `The end year can't be after ${thisYear}.` });
    }
    if (d.ended_year != null && d.ended_year < d.founded_year) {
      ctx.addIssue({ code: "custom", path: ["ended_year"], message: "The end year can't be before the founded year." });
    }
  });

export type FederationInput = z.infer<typeof federationSchema>;
