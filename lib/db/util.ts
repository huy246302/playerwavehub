export const PAGE_SIZE = 25;
export const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);
export const fail = (e: { message: string; code?: string }) =>
  new Error(`${e.message}${e.code ? ` (${e.code})` : ""}`);