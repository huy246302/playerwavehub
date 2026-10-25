import { z } from "zod";
import { optText, toNumber } from "@/lib/validation/common";

export const sourceLinkSchema = z.object({
  source_id: z.preprocess(toNumber, z.number().int().positive({ message: "Select a source." })),
  note: optText(500),
});
export type SourceLinkInput = z.infer<typeof sourceLinkSchema>;