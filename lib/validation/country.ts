import { z } from "zod";
import { blank, optUrl } from "@/lib/validation/common";

export const countrySchema = z.object({
  name: z.string().trim().min(2, "Enter the country name.").max(120),
  iso_code: z.preprocess(
    (v) => {
      const b = blank(v);
      return b === undefined ? undefined : String(b).trim().toUpperCase();
    },
    z.string().regex(/^[A-Z]{2}$/, "Use a 2-letter ISO code, for example VN.").optional()
  ),
  flag_url: optUrl,
  is_historical: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

export type CountryInput = z.infer<typeof countrySchema>;