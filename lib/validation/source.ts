import { z } from "zod";
import { optText, optUrl } from "@/lib/validation/common";

export const sourceSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(300),
  url: optUrl,
  publisher: optText(200),
  author: optText(200),
  published_on: z.preprocess((v) => (v === "" ? undefined : v), z.string().date().optional()),
  accessed_on: z.preprocess((v) => (v === "" ? undefined : v), z.string().date().optional()),
  notes: optText(2000),
});
export type SourceInput = z.infer<typeof sourceSchema>;