import { z } from "zod";
import { optInt } from "@/lib/validation/common";

export const COACH_HIDDEN_ATTRIBUTE_GROUPS = [
  { title: "Reputation", fields: ["home_reputation", "world_reputation"] },
  {
    title: "Hidden attributes",
    fields: ["ambition", "loyalty", "pressure", "professionalism", "sportsmanship", "temperament", "controversy"],
  },
  { title: "Personality", fields: ["ego", "resilience", "patriotism", "financial_motivation", "youth_trust"] },
] as const;

export const ALL_COACH_HIDDEN_FIELDS: string[] = COACH_HIDDEN_ATTRIBUTE_GROUPS.flatMap((g) => g.fields);

export const COACH_HIDDEN_ATTRIBUTE_HINTS: Record<string, string> = {
  controversy: "Higher = more bold or confrontational behaviour.",
  ego: "Higher = bigger need to be the star.",
  financial_motivation: "Higher = money weighed more in his career choices.",
  youth_trust: "How willing he was to give young players a real chance.",
};

export const coachHiddenAttributesSchema = z.object(
  Object.fromEntries(ALL_COACH_HIDDEN_FIELDS.map((f) => [f, optInt(1, 100)]))
);
export type CoachHiddenAttributesInput = z.infer<typeof coachHiddenAttributesSchema>;