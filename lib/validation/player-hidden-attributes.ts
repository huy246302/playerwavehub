import { z } from "zod";
import { optInt } from "@/lib/validation/common";

export const HIDDEN_ATTRIBUTE_GROUPS = [
  {
    title: "Hidden attributes",
    fields: [
      "consistency", "dirtiness", "important_matches", "injury_proneness", "versatility",
      "adaptability", "ambition", "controversy", "loyalty", "pressure",
      "professionalism", "sportsmanship", "temperament",
    ],
  },
  {
    title: "Personality",
    fields: ["ego", "charisma", "resilience", "mentoring", "media_skill", "media_openness", "patriotism", "financial_motivation"],
  },
  { title: "Overall", fields: ["current_ability"] },
] as const;

export const ALL_HIDDEN_FIELDS: string[] = HIDDEN_ATTRIBUTE_GROUPS.flatMap((g) => g.fields);

// carried over from the `comment on column ...` notes in the init migration
export const HIDDEN_ATTRIBUTE_HINTS: Record<string, string> = {
  dirtiness: "Higher = more likely to bend or break the rules.",
  injury_proneness: "Higher = more injury-prone.",
  controversy: "Higher = more bold or confrontational behaviour.",
  ego: "Higher = bigger need to be the star.",
  media_skill: "Low = gaffe-prone, high = polished with the press.",
  media_openness: "Low = guarded, high = outspoken with the press.",
  financial_motivation: "Higher = money weighed more in his career choices.",
  current_ability: "Overall peak rating.",
};

export const playerHiddenAttributesSchema = z.object(
  Object.fromEntries(ALL_HIDDEN_FIELDS.map((f) => [f, optInt(1, 100)]))
);
export type PlayerHiddenAttributesInput = z.infer<typeof playerHiddenAttributesSchema>;