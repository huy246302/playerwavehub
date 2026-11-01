// Builds a list URL from only the values that are set, e.g. /clubs?country=3&sort=name_desc
export function buildHref(
  basePath: string,
  params: Record<string, string | number | null | undefined>
) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v) !== "") u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `${basePath}?${s}` : basePath;
}
