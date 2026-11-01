// The sort choices of each list. Only keys defined here are accepted from the URL,
// so a made-up ?sort= value can never reach the database.
export type OrderBy = { column: string; ascending: boolean };
export type SortDef = { label: string; order: OrderBy[] };
export type SortMap = Record<string, SortDef>;

// by("Label", ["column", "asc"], ["id", "desc"]) -> one sort choice
export const by = (label: string, ...cols: [string, "asc" | "desc"][]): SortDef => ({
  label,
  order: cols.map(([column, dir]) => ({ column, ascending: dir === "asc" })),
});

export const sortOptions = (map: SortMap) =>
  Object.entries(map).map(([value, d]) => ({ value, label: d.label }));

export function resolveSort(requested: string | undefined, map: SortMap, fallback: string) {
  const key = requested && Object.prototype.hasOwnProperty.call(map, requested) ? requested : fallback;
  return { key, order: map[key].order };
}
