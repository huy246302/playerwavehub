import { ArchiveIcon } from "@/components/Sidebar";

const categories = [
  { id: "people", label: "People", description: "The people behind the game", icon: "people" as const, count: 0 },
  { id: "players", label: "Players", description: "Playing careers and biographies", icon: "player" as const, count: 0 },
  { id: "head-coaches", label: "Head coaches", description: "Coaching careers and profiles", icon: "coach" as const, count: 0 },
  { id: "clubs", label: "Clubs", description: "Club histories and identities", icon: "club" as const, count: 0 },
  { id: "national-teams", label: "National teams", description: "International football teams", icon: "team" as const, count: 0 },
  { id: "countries", label: "Countries", description: "The geography of the game", icon: "country" as const, count: 0 },
  { id: "sources", label: "Sources", description: "References that support each story", icon: "source" as const, count: 0 },
];

export default function Home() {
  return (
    <main id="overview" className="dashboard-page">
      <div className="breadcrumb-bar">
        <div className="breadcrumbs"><span>Archive</span><i>/</i><strong>Overview</strong></div>
        <span className="empty-status"><i/> No records yet</span>
      </div>

      <div className="dashboard-content">
        <header className="page-title-row">
          <div>
            <h1>Archive overview</h1>
            <p>Your collection of football&apos;s people, teams and the sources behind their stories.</p>
          </div>
          <span className="empty-collection">Empty collection</span>
        </header>

        <section className="welcome-panel" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <p className="welcome-kicker">YOUR COLLECTION STARTS HERE</p>
            <h2 id="welcome-title">Every legend starts with a first record.</h2>
            <p>Start with a player, a club or a story you want to preserve.<br className="desktop-break"/> Add the essentials now; build the connections as you go.</p>
            <div className="welcome-actions">
              <a className="primary-action" href="#people"><span>+</span> Add first record</a>
              <a className="secondary-action" href="#sources"><ArchiveIcon name="book"/> Start with a source</a>
            </div>
          </div>
          <div className="field-card" aria-label="Football pitch illustration">
            <div className="field-card-heading"><span>THE BEAUTIFUL GAME</span><span className="ball-mark">◉</span></div>
            <svg className="pitch" viewBox="0 0 180 92" role="img" aria-label="A simple football field">
              <rect x="1" y="1" width="178" height="90"/>
              <line x1="90" y1="1" x2="90" y2="91"/>
              <circle cx="90" cy="46" r="16"/>
              <circle className="pitch-dot" cx="90" cy="46" r="1.5"/>
              <rect x="1" y="22" width="20" height="48"/>
              <rect x="159" y="22" width="20" height="48"/>
              <rect x="1" y="33" width="7" height="26"/>
              <rect x="172" y="33" width="7" height="26"/>
            </svg>
            <p>A history worth keeping.</p>
          </div>
        </section>

        <div className="overview-grid">
          <section className="archive-section" aria-labelledby="archive-title">
            <div className="section-title-row">
              <h2 id="archive-title">Your archive</h2>
              <span>7 categories · all empty</span>
            </div>
            <div className="archive-table">
              <div className="archive-table-head"><span>CATEGORY</span><span>RECORDS</span></div>
              {categories.map((category) => (
                <a className="archive-row" href={`#${category.id}`} id={category.id} key={category.id}>
                  <span className="category-icon"><ArchiveIcon name={category.icon}/></span>
                  <strong>{category.label}</strong>
                  <span className="category-description">{category.description}</span>
                  <b>{category.count}</b>
                  <span className="row-chevron">›</span>
                </a>
              ))}
              <p className="archive-footnote"><span>ⓘ</span> Players and head coaches are part of People, not additional totals.</p>
            </div>
          </section>

          <aside className="getting-started">
            <h2>A good place to begin</h2>
            <div className="steps-card">
              <div className="step"><span>01</span><div><strong>Choose your starting point</strong><p>Pick a person, club or national team. A name is a good place to begin.</p></div></div>
              <div className="step"><span>02</span><div><strong>Keep a source close</strong><p>Save a book, article or reference so the story can be traced back.</p></div></div>
              <div className="step"><span>03</span><div><strong>Connect the story</strong><p>Link people to teams and countries as your collection takes shape.</p></div></div>
            </div>

            <section className="recent-section">
              <div className="recent-heading"><h2>Recently added</h2><span>◷</span></div>
              <div className="recent-empty"><ArchiveIcon name="source"/><div><strong>No records added yet</strong><p>Your newest additions will appear here once you begin your collection.</p></div></div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}