import { z } from "zod";
import { optText, optUrl } from "@/lib/validation/common";

export const nationalTeamSchema = z.object({
  name: z.string().trim().min(2, "Enter the team name.").max(200),
  country_id: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().positive({ message: "Select a country." })
  ),
  crest_url: optUrl,
  description: optText(4000),
});

export type NationalTeamInput = z.infer<typeof nationalTeamSchema>;