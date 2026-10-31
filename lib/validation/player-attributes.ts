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

export type PlayerKind = "goalkeeper" | "outfield";

export const GOALKEEPING_FIELDS: string[] = ATTRIBUTE_GROUPS
  .filter((g) => g.title === "Goalkeeping").flatMap((g) => [...g.fields]);
export const OUTFIELD_FIELDS: string[] = ATTRIBUTE_GROUPS
  .filter((g) => g.title !== "Goalkeeping").flatMap((g) => [...g.fields]);

// Outfield attributes that also matter for goalkeepers. A goalkeeper's empty fields are
// filled with 1 EXCEPT these, which must be entered by hand. Edit this list to change the rule.
export const GOALKEEPER_SHARED_FIELDS: string[] = [
  "passing", "first_touch", "technique", "acrobat",
  "aggression", "anticipation", "bravery", "composure", "concentration", "decisions",
  "determination", "leadership", "positioning", "teamwork", "vision", "work_rate",
  "acceleration", "agility", "balance", "jumping_reach", "natural_fitness", "pace", "stamina", "strength",
];

// The primary position decides the kind. No primary position yet -> null (nothing is auto-filled).
export const playerKindFromPrimary = (position?: string | null): PlayerKind | null =>
  !position ? null : position === "GK" ? "goalkeeper" : "outfield";

// Fields that default to 1 when left empty for this kind of player.
export const autoFillFields = (kind: PlayerKind | null): string[] =>
  kind === "outfield" ? GOALKEEPING_FIELDS
  : kind === "goalkeeper" ? OUTFIELD_FIELDS.filter((f) => !GOALKEEPER_SHARED_FIELDS.includes(f))
  : [];

// Returns a copy of the submitted values with empty auto-fill fields set to "1",
// plus the list of fields that were filled.
export function fillEmptyDefaults(kind: PlayerKind | null, input: Record<string, unknown>) {
  const values: Record<string, unknown> = { ...input };
  const filled: string[] = [];
  for (const f of autoFillFields(kind)) {
    const v = values[f];
    if (v === undefined || v === null || String(v).trim() === "") { values[f] = "1"; filled.push(f); }
  }
  return { values, filled };
}

export const labelize = (key: string) => key.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");