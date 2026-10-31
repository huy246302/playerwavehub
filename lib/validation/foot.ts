import { z } from "zod";

// Level 1-6. The stronger foot is always 6, the weaker foot is 1-5.
export const FOOT_LEVEL_LABELS = [
  "Very weak", "Weak", "Reasonable", "Fairly strong", "Strong", "Very strong",
] as const;

export const footSchema = z.discriminatedUnion("foot", [
  z.object({ foot: z.literal("both") }),
  z.object({
    foot: z.enum(["left", "right"]),
    weaker: z.number({ error: "Choose how strong the weaker foot is." })
      .int().min(1, "Choose a level from 1 to 5.").max(5, "Choose a level from 1 to 5."),
  }),
]);

export type FootInput = z.infer<typeof footSchema>;
