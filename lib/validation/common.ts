import { z } from "zod";

export const blank = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;

const httpUrl = (v: string) => {
  try { return ["http:", "https:"].includes(new URL(v).protocol); } catch { return false; }
};

export const optText = (max = 2000) =>
  z.preprocess(blank, z.string().trim().max(max).optional());

export const optUrl = z.preprocess(
  blank,
  z.string().trim().refine(httpUrl, "Enter a full link starting with https://").optional()
);

export const optInt = (min: number, max: number) =>
  z.preprocess((v) => {
    const b = blank(v);
    return b === undefined ? undefined : Number(b);
  }, z.number().int().min(min).max(max).optional());