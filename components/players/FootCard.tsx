"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePlayerFoot } from "@/lib/actions/player-feet";
import { FOOT_LEVEL_LABELS } from "@/lib/validation/foot";
import type { PlayerFeet } from "@/lib/db/player-feet";
import { Card, primaryBtn } from "@/components/ui/kit";

type Foot = "left" | "right" | "both";

const OPTIONS: { value: Foot; label: string }[] = [
  { value: "left", label: "Left-footed" },
  { value: "right", label: "Right-footed" },
  { value: "both", label: "Two-footed" },
];

function Meter({ label, level }: { label: string; level: number | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-neutral-600">{label}</span>
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className={`h-2.5 flex-1 rounded-full ${level != null && n <= level ? "bg-[#254a39]" : "bg-neutral-200"}`} />
        ))}
      </div>
      <span className="w-36 text-right text-sm text-neutral-800">
        {level != null ? `${level}/6 · ${FOOT_LEVEL_LABELS[level - 1]}` : "—"}
      </span>
    </div>
  );
}

export default function FootCard({ playerId, feet }: { playerId: number; feet: PlayerFeet | null }) {
  const router = useRouter();

  // what is saved in the database right now
  const savedFoot: Foot | null = feet?.preferred_foot ?? null;
  const savedWeaker: number | null =
    feet?.preferred_foot === "left" ? feet.right_foot_level
    : feet?.preferred_foot === "right" ? feet.left_foot_level : null;

  const [foot, setFoot] = useState<Foot | null>(savedFoot);
  const [weaker, setWeaker] = useState<number | null>(savedWeaker);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const weakerSide = foot === "left" ? "right" : "left";
  const leftLevel = foot === "left" || foot === "both" ? 6 : foot === "right" ? weaker : null;
  const rightLevel = foot === "right" || foot === "both" ? 6 : foot === "left" ? weaker : null;

  const complete = foot === "both" || (foot !== null && weaker !== null);
  const dirty = foot !== savedFoot || (foot !== "both" && weaker !== savedWeaker);

  const save = async () => {
    if (!foot || !complete) return;
    setBusy(true); setMsg(null);
    const res = await savePlayerFoot(playerId, foot === "both" ? { foot } : { foot, weaker });
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: res.message ?? "Could not save the foot." }); return; }
    setMsg({ ok: true, text: "Foot saved." });
    router.refresh();
  };

  const summary =
    foot === "both" ? "Two-footed: very strong with both feet."
    : foot && weaker ? `${foot === "left" ? "Left" : "Right"}-footed: very strong on the ${foot} foot, ${FOOT_LEVEL_LABELS[weaker - 1].toLowerCase()} on the ${weakerSide}.`
    : foot ? `Now choose how strong the ${weakerSide} foot is.`
    : null;

  return (
    <Card title="Foot" note={feet ? "Saved" : "Not set yet"}>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Preferred foot</p>
          <div role="radiogroup" aria-label="Preferred foot" className="inline-flex rounded-lg border border-neutral-300 bg-white p-0.5">
            {OPTIONS.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={foot === o.value}
                onClick={() => { setFoot(o.value); setMsg(null); if (o.value === "both") setWeaker(null); }}
                className={`rounded-md px-4 py-1.5 text-sm ${foot === o.value ? "bg-[#254a39] text-white" : "text-neutral-700 hover:bg-neutral-50"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {(foot === "left" || foot === "right") && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              How strong is the {weakerSide} foot?
            </p>
            <div role="radiogroup" aria-label={`${weakerSide} foot strength`} className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={weaker === n}
                  onClick={() => { setWeaker(n); setMsg(null); }}
                  className={`rounded-lg border px-1 py-2 text-center ${weaker === n ? "border-[#254a39] bg-[#e4eee8]" : "border-neutral-200 bg-white hover:bg-neutral-50"}`}>
                  <span className="block text-base font-semibold text-neutral-900">{n}</span>
                  <span className="block text-[11px] leading-tight text-neutral-600">{FOOT_LEVEL_LABELS[n - 1]}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              The stronger foot is always 6 (very strong). A {weakerSide} foot that is also very strong means the player is two-footed.
            </p>
          </div>
        )}

        <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-4">
          <Meter label="Left foot" level={leftLevel} />
          <Meter label="Right foot" level={rightLevel} />
          {summary && <p className="pt-1 text-sm text-neutral-800">{summary}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={primaryBtn} disabled={busy || !complete || !dirty} onClick={save}>
            {busy ? "Saving…" : "Save foot"}
          </button>
          <p role="status" aria-live="polite" className={`text-sm ${msg ? (msg.ok ? "text-green-700" : "text-red-600") : "text-neutral-500"}`}>
            {msg?.text ?? (!feet ? "Required before this player can be published." : "")}
          </p>
        </div>
        <p className="text-xs text-neutral-500">
          Scale: 1 very weak · 2 weak · 3 reasonable · 4 fairly strong · 5 strong · 6 very strong.
        </p>
      </div>
    </Card>
  );
}
