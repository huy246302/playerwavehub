import { POSITION_CODES } from "@/lib/validation/position";

export type PositionCode = (typeof POSITION_CODES)[number];

export const POSITION_NAMES: Record<PositionCode, string> = {
  GK: "Goalkeeper", LB: "Left back", RB: "Right back", CB: "Centre back",
  LWB: "Left wing-back", RWB: "Right wing-back", DM: "Defensive midfielder",
  CM: "Central midfielder", LM: "Left midfielder", RM: "Right midfielder",
  AM: "Attacking midfielder", LW: "Left winger", RW: "Right winger", ST: "Striker",
};

// Where each position sits on the pitch graphic (own goal at the bottom, viewBox 200 x 280).
export const PITCH_COORDS: Record<PositionCode, { x: number; y: number }> = {
  GK: { x: 100, y: 252 },
  LB: { x: 32, y: 208 }, CB: { x: 100, y: 214 }, RB: { x: 168, y: 208 },
  LWB: { x: 22, y: 172 }, DM: { x: 100, y: 176 }, RWB: { x: 178, y: 172 },
  LM: { x: 30, y: 124 }, CM: { x: 100, y: 130 }, RM: { x: 170, y: 124 },
  AM: { x: 100, y: 92 },
  LW: { x: 30, y: 62 }, RW: { x: 170, y: 62 },
  ST: { x: 100, y: 34 },
};

// How comfortable the player is in a position. The label is always shown next to the colour.
export function ratingTier(rating: number) {
  if (rating >= 90) return { label: "Natural", fill: "#1f4535", text: "#ffffff" };
  if (rating >= 75) return { label: "Accomplished", fill: "#2f6b50", text: "#ffffff" };
  if (rating >= 50) return { label: "Competent", fill: "#5b9a7a", text: "#10261b" };
  if (rating >= 25) return { label: "Unconvincing", fill: "#a9cdb9", text: "#10261b" };
  return { label: "Awkward", fill: "#dfe9e2", text: "#10261b" };
}
