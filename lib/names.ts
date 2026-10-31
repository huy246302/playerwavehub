type Named = { display_name?: string | null; full_name?: string | null } | null | undefined;

// The name shown first: the display name ("Pelé") if there is one, otherwise the full name.
export const displayName = (p: Named, fallback = "—") =>
  p?.display_name?.trim() || p?.full_name || fallback;

// The full name, only when it differs from what displayName shows (used as a sub-line).
export const fullNameIfDifferent = (p: Named) => {
  const d = p?.display_name?.trim();
  return d && p?.full_name && d !== p.full_name ? p.full_name : null;
};

// For dropdowns: "Pelé (Edson Arantes do Nascimento)" or just the name.
export const biographyLabel = (p: Named) =>
  !p ? "—" : fullNameIfDifferent(p) ? `${displayName(p)} (${p.full_name})` : displayName(p);

// Longest country name shown before it is cut with "…". Change this number to taste.
export const COUNTRY_NAME_MAX = 28;

export const clip = (text: string, max = COUNTRY_NAME_MAX) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
