import { z } from "zod";

export const ATTRIBUTE_GROUPS = [
  { title: "Technical", fields: ["acrobat","corners","crossing","dribbling","finishing","first_touch","free_kick_taking","heading","long_shots","long_throws","marking","passing","penalty_taking","tackling","technique"] },
  { title: "Mental", fields: ["aggression","anticipation","bravery","composure","concentration","decisions","determination","flair","leadership","off_the_ball","positioning","teamwork","vision","work_rate"] },
  { title: "Physical", fields: ["acceleration","agility","balance","jumping_reach","natural_fitness","pace","stamina","strength"] },
  { title: "Goalkeeping", fields: ["aerial_reach","command_of_area","communication","eccentricity","handling","kicking","one_on_ones","penalty_stopping","punching","reflexes","rushing_out","throwing"] },
] as const;

export const ALL_ATTRIBUTE_FIELDS: string[] = ATTRIBUTE_GROUPS.flatMap((g) => g.fields);

export const playerAttributesSchema = z.object(
  Object.fromEntries(ALL_ATTRIBUTE_FIELDS.map((f) => [f, z.coerce.number().int().min(1, "1–100").max(100, "1–100")]))
);

export const labelize = (key: string) => key.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");