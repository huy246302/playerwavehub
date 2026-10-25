import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCounts } from "@/lib/db/counts";
import { ArchiveIcon, type IconName } from "@/components/ArchiveIcon";
import { Breadcrumbs } from "@/components/ui/kit";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];
const word = (n: number) => WORDS[n] ?? String(n);
const plural = (n: number, one: string, many = one + "s") => (n === 1 ? one : many);
const one = <T,>(v: T | T[] | null | undefined) => (Array.isArray(v) ? v[0] : v ?? undefined);

const CATEGORIES: { key: string; label: string; blurb: string; href: string; icon: IconName }[] = [
  { key: "biographies", label: "Biographies", blurb: "Life stories behind every legend", href: "/biographies", icon: "people" },
  { key: "players", label: "Players", blurb: "Playing careers and statistics", href: "/players", icon: "player" },
  { key: "coaches", label: "Head coaches", blurb: "Coaching careers and profiles", href: "/head-coach", icon: "coach" },
  { key: "clubs", label: "Clubs", blurb: "Club histories and identities", href: "/clubs", icon: "club" },
  { key: "national_teams", label: "National teams", blurb: "International football teams", href: "/national-teams", icon: "team" },
  { key: "countries", label: "Countries", blurb: "The geography of the game", href: "/countries", icon: "country" },
  { key: "sources", label: "Sources", blurb: "References that support each story", href: "/sources", icon: "source" },
];

const STEPS = [
  { title: "Choose your starting point", body: "Pick a person, club or national team. A name is a good place to begin.", href: "/biographies" },
  { title: "Keep a source close", body: "Save a book, article or reference so the story can be traced back.", href: "/sources" },
  { title: "Connect the story", body: "Link people to teams and countries as your collection takes shape.", href: "/clubs" },
];

async function getRecent() {
  const { data } = await createAdminClient()
    .from("biographies")
    .select("id, full_name, display_name, date_of_birth, created_at, players(id, is_published), coaches(id, is_published)")
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

export default async function Overview() {
  const [counts, recent] = await Promise.all([getCounts(), getRecent()]);
  const { biographies: bios, players, coaches } = counts;
  const roles = players + coaches;
  const empty = bios === 0;

  const headline = empty
    ? "Your archive is waiting for its first story."
    : `${word(bios)} ${plural(bios, "biography", "biographies")}. ${word(players)} ${plural(players, "player")}. ${word(coaches)} ${plural(coaches, "coach", "coaches")}.`;

  return (
    // padding 0: the layout's <main> already provides it
    <div className="dashboard-content" style={{ padding: 0 }}>
      <div className="mb-3">
        <Breadcrumbs items={[{ label: "Archive" }, { label: "Overview" }]} />
      </div>

      <div className="page-title-row">
        <div>
          <h1>Archive overview</h1>
          <p>Your collection of football biographies, teams and the sources behind their stories.</p>
        </div>
        <span className="empty-collection">
          {bios} {plural(bios, "biography", "biographies")} · {roles} role {plural(roles, "record")}
        </span>
      </div>

      <section className="welcome-panel">
        <div className="welcome-copy">
          <p className="welcome-kicker">{empty ? "GETTING STARTED" : "YOUR COLLECTION"}</p>
          <h2>{headline}</h2>
          <p>
            {empty
              ? "Start with a biography, then connect it to clubs, countries and the sources behind it."
              : "Keep building the collection: add a biography, then connect it to teams, countries and sources."}
          </p>
          <div className="welcome-actions">
            {/* point at /biographies/new once that route exists */}
            <Link href="/biographies" className="primary-action">
              <span>+</span> Add biography
            </Link>
            <Link href="/biographies" className="secondary-action">
              <ArchiveIcon name="people" /> Browse biographies
            </Link>
          </div>
        </div>

        <div className="field-card" aria-hidden>
          <div className="field-card-heading">
            <span>THE BEAUTIFUL GAME</span>
            <span className="ball-mark">◎</span>
          </div>
          <svg className="pitch" viewBox="0 0 132 68">
            <rect width="132" height="68" fill="#f3f6ee" />
            <g fill="none" stroke="#9db5a2" strokeWidth="0.8">
              <rect x="3" y="3" width="126" height="62" />
              <line x1="66" y1="3" x2="66" y2="65" />
              <circle cx="66" cy="34" r="8" />
              <rect x="3" y="18" width="16" height="32" />
              <rect x="3" y="26" width="6" height="16" />
              <rect x="113" y="18" width="16" height="32" />
              <rect x="123" y="26" width="6" height="16" />
            </g>
          </svg>
          <p>A history worth keeping.</p>
        </div>
      </section>

      <div className="overview-grid">
        <section>
          <div className="section-title-row">
            <h2>Your archive</h2>
            <span>{CATEGORIES.length} categories</span>
          </div>
          <div className="archive-table">
            <div className="archive-table-head">
              <span>CATEGORY</span>
              <span>RECORDS</span>
            </div>
            {CATEGORIES.map((c) => (
              <Link key={c.key} href={c.href} className="archive-row">
                <span className="category-icon"><ArchiveIcon name={c.icon} /></span>
                <strong>{c.label}</strong>
                <span className="category-description">{c.blurb}</span>
                <b>{counts[c.key as keyof typeof counts]}</b>
                <span className="row-chevron">›</span>
              </Link>
            ))}
            <p className="archive-footnote">
              <span>ⓘ</span>
              {players} {plural(players, "player")} and {coaches} {plural(coaches, "coach record")} link to {bios} {plural(bios, "biography", "biographies")}.
            </p>
          </div>
        </section>

        <aside className="getting-started">
          <h2>A good place to begin</h2>
          <div className="steps-card">
            {STEPS.map((s, i) => (
              <Link key={s.title} href={s.href} className="step">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.body}</p>
                </div>
              </Link>
            ))}
          </div>

          <section className="recent-section">
            <div className="recent-heading">
              <h2>Recently added</h2>
              <span>◷</span>
            </div>
            {recent.length === 0 ? (
              <div className="recent-empty">
                <ArchiveIcon name="book" />
                <div>
                  <strong>Nothing here yet</strong>
                  <p>New biographies will appear here as you add them.</p>
                </div>
              </div>
            ) : (
              <div className="recent-list">
                {recent.map((r) => {
                  const p = one(r.players);
                  const c = one(r.coaches);
                  const role = p ? "Player" : c ? "Coach" : "Biography";
                  const href = p ? `/players/${p.id}` : c ? `/head-coach/${c.id}` : "/biographies";
                  const published = p?.is_published ?? c?.is_published;
                  const born = r.date_of_birth?.slice(0, 4);
                  return (
                    <Link key={r.id} href={href} className="recent-item">
                      <span className="role-pill">{role}</span>
                      <span className="recent-main">
                        <strong>{r.display_name || r.full_name}</strong>
                        <small>{born ? `Born ${born} · ` : ""}Biography #{r.id}</small>
                      </span>
                      {published !== undefined && (
                        <span className={`status-pill ${published ? "published" : ""}`}>
                          {published ? "Published" : "Draft"}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}