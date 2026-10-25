import { z } from "zod";
import { toNumber } from "@/lib/validation/common";

export const POSITION_CODES = [
  "GK", "LB", "RB", "CB", "LWB", "RWB", "DM", "CM", "LM", "RM", "AM", "LW", "RW", "ST",
] as const;

export const positionSchema = z.object({
  position: z.enum(POSITION_CODES, { message: "Select a position." }),
  rating: z.preprocess(toNumber, z.number().int().min(1).max(100)),
  is_primary: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});
export type PositionInput = z.infer<typeof positionSchema>;