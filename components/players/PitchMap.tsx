"use client";
import { POSITION_CODES } from "@/lib/validation/position";
import { PITCH_COORDS, POSITION_NAMES, ratingTier, type PositionCode } from "@/lib/positions";
import type { PlayerPosition } from "@/lib/db/player-positions";

// A pitch with all 14 positions. Positions the player can play are filled by how
// comfortable he is there; the primary position has a gold ring and a star.
export default function PitchMap({
  positions, selected, onSelect,
}: {
  positions: PlayerPosition[];
  selected?: PositionCode | "" | null;
  onSelect?: (code: PositionCode) => void;   // set only in edit mode
}) {
  const byCode = new Map(positions.map((p) => [p.position as PositionCode, p]));
  const interactive = !!onSelect;

  return (
    <svg viewBox="0 0 200 280" role="group" aria-label="Pitch map of the positions this player can play"
      className="mx-auto h-auto w-full max-w-[250px]">
      <rect x="0" y="0" width="200" height="280" rx="10" fill="#e8f0ea" />
      <g fill="none" stroke="#b5cabb" strokeWidth="1.2">
        <rect x="8" y="8" width="184" height="264" />
        <line x1="8" y1="140" x2="192" y2="140" />
        <circle cx="100" cy="140" r="24" />
        <rect x="56" y="8" width="88" height="36" />
        <rect x="78" y="8" width="44" height="14" />
        <rect x="56" y="236" width="88" height="36" />
        <rect x="78" y="258" width="44" height="14" />
      </g>

      {POSITION_CODES.map((code) => {
        const p = byCode.get(code);
        const tier = p ? ratingTier(p.rating) : null;
        const { x, y } = PITCH_COORDS[code];
        const isSelected = selected === code;
        const label = p
          ? `${code}, ${POSITION_NAMES[code]}, rating ${p.rating}${p.is_primary ? ", primary position" : ""}`
          : `${code}, ${POSITION_NAMES[code]}, not added`;
        const press = () => onSelect?.(code);

        return (
          <g key={code} transform={`translate(${x} ${y})`}
            {...(interactive ? {
              role: "button", tabIndex: 0, "aria-label": label, onClick: press,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(); }
              },
            } : {})}
            className={interactive ? "cursor-pointer focus:outline-none [&:focus>circle.ring]:stroke-neutral-900" : undefined}>
            {!interactive && <title>{label}</title>}
            <circle className="ring" r="14.5" fill="none"
              stroke={isSelected ? "#171717" : p?.is_primary ? "#c8962c" : "transparent"}
              strokeWidth={isSelected || p?.is_primary ? 2.5 : 0} />
            <circle r="11" fill={tier?.fill ?? "#f6f3ea"}
              stroke={p ? "none" : "#b9b3a0"} strokeDasharray={p ? undefined : "2 2"} strokeWidth="1" />
            <text textAnchor="middle" dy="2.6" fontSize="7.2" fontWeight="600"
              fill={tier?.text ?? "#8a8574"}>{code}</text>
            {p && <text y="24" textAnchor="middle" fontSize="6.8" fill="#35433a">{p.rating}</text>}
            {p?.is_primary && <text y="-16.5" textAnchor="middle" fontSize="8" fill="#c8962c">★</text>}
          </g>
        );
      })}
    </svg>
  );
}
