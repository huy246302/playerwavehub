import FootCard from "@/components/players/FootCard";
import PositionsCard from "@/components/players/PositionsCard";
import type { PlayerPosition } from "@/lib/db/player-positions";
import type { PlayerFeet } from "@/lib/db/player-feet";

// Same props as before, so the attributes page does not change.
export default function PositionsFeetCard({
  playerId, positions, feet,
}: { playerId: number; positions: PlayerPosition[]; feet: PlayerFeet | null }) {
  return (
    <div className="space-y-6">
      <FootCard playerId={playerId} feet={feet} />
      <PositionsCard playerId={playerId} positions={positions} />
    </div>
  );
}
