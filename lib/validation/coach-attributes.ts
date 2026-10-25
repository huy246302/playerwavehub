import { z } from "zod";
import { optInt } from "@/lib/validation/common";

export const COACH_ATTRIBUTE_GROUPS = [
  {
    title: "Coaching",
    fields: [
      "coaching_attacking", "coaching_defending", "coaching_fitness",
      "coaching_goalkeeper_distribution", "coaching_goalkeeper_handling", "coaching_goalkeeper_shot_stopping",
      "coaching_mental", "coaching_tactical", "coaching_technical",
      "coaching_working_with_youngsters", "coaching_set_pieces",
    ],
  },
  {
    title: "Mental",
    fields: ["adaptability", "determination", "player_knowledge", "youngster_knowledge", "level_of_discipline", "people_management", "motivating"],
  },
  {
    title: "Management",
    fields: [
      "tactical_innovation", "tactical_flexibility", "big_match_management", "crisis_management",
      "recruitment", "charisma", "media_skill", "media_openness",
    ],
  },
] as const;

export const ALL_COACH_ATTRIBUTE_FIELDS: string[] = COACH_ATTRIBUTE_GROUPS.flatMap((g) => g.fields);

export const COACH_ATTRIBUTE_HINTS: Record<string, string> = {
  media_skill: "Low = gaffe-prone, high = polished with the press.",
  media_openness: "Low = guarded, high = outspoken with the press.",
};

export const coachAttributesSchema = z.object(
  Object.fromEntries(ALL_COACH_ATTRIBUTE_FIELDS.map((f) => [f, optInt(1, 100)]))
);
export type CoachAttributesInput = z.infer<typeof coachAttributesSchema>;