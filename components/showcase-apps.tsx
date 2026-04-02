"use client";

import { FormEvent, useMemo, useState } from "react";

type ShowcaseAppsProps = {
  slug: string;
};

type Fighter = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  region: string;
};

type PrintJob = {
  id: string;
  file: string;
  printer: string;
  status: "Queued" | "Printing" | "Paused" | "Done";
  owner: string;
};

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
};

export function ShowcaseApps({ slug }: ShowcaseAppsProps) {
  if (slug === "ready-set-travel") return <ReadySetTravelApp />;
  if (slug === "rick-and-morty-react") return <RickAndMortyApp />;
  if (slug === "ufc-api") return <UfcApp />;
  if (slug === "icepik-octo-manager") return <OctoManagerApp />;
  return null;
}

function AppFrame({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="showcase-app-shell">
      <header className="showcase-app-header">
        <p className="eyebrow">Integrated Runtime</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </header>
      <section className="showcase-app-body">{children}</section>
    </div>
  );
}

function ReadySetTravelApp() {
  const cards = [
    { name: "Alps Mountain Hiking Tour", time: "4 days | 10 stops", price: "$1,500" },
    { name: "Snorkel The Barrier Reef Tour", time: "2 days | 2 stops", price: "$1,000" },
    { name: "Tour The Pyramids On Camelback", time: "2 days | 2 stops", price: "$2,000" }
  ];
  return (
    <AppFrame title="ReadySetTravel" subtitle="Travel front-end integrated directly into resume-site.">
      <div className="showcase-nav">
        <span>Home</span>
        <span>Destinations</span>
        <span>Tours</span>
        <span>Blog</span>
      </div>
      <div className="showcase-hero-banner">
        <h2>Book The Trip Of A Lifetime</h2>
        <p>Get the best tips for your dream adventure.</p>
      </div>
      <div className="grid columns-3">
        {cards.map((card) => (
          <article key={card.name} className="card">
            <h3>{card.name}</h3>
            <p className="muted">{card.time}</p>
            <p>{card.price}</p>
            <button className="btn btn-primary" type="button">
              Book Now
            </button>
          </article>
        ))}
      </div>
    </AppFrame>
  );
}

function RickAndMortyApp() {
  const [query, setQuery] = useState("rick");
  const [items, setItems] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchCharacters(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(query.trim())}`);
      const payload = await response.json();
      if (!response.ok) {
        setItems([]);
        setError(payload?.error || "No results");
      } else {
        setItems((payload?.results || []).slice(0, 8));
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppFrame title="Rick And Morty API Lookup" subtitle="Search characters using the public API from inside resume-site.">
      <form onSubmit={searchCharacters} className="showcase-form-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search character name" />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error ? <p className="muted">{error}</p> : null}
      <div className="grid columns-2">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <img src={item.image} alt={item.name} className="showcase-avatar" />
            <h3>{item.name}</h3>
            <p className="muted">
              {item.status} • {item.species}
            </p>
          </article>
        ))}
      </div>
    </AppFrame>
  );
}

function UfcApp() {
  const [fighters, setFighters] = useState<Fighter[]>([
    { id: "f1", name: "Max Holloway", wins: 26, losses: 7, region: "USA" },
    { id: "f2", name: "Islam Makhachev", wins: 26, losses: 1, region: "Russia" }
  ]);
  const [name, setName] = useState("");
  const [wins, setWins] = useState("0");
  const [losses, setLosses] = useState("0");
  const [region, setRegion] = useState("");

  function addFighter(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const next: Fighter = {
      id: `f-${Date.now()}`,
      name: name.trim(),
      wins: Number(wins || 0),
      losses: Number(losses || 0),
      region: region.trim() || "Unknown"
    };
    setFighters((prev) => [next, ...prev]);
    setName("");
    setWins("0");
    setLosses("0");
    setRegion("");
  }

  function removeFighter(id: string) {
    setFighters((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <AppFrame title="UFC API" subtitle="Integrated fighter CRUD-style dashboard inside resume-site.">
      <form onSubmit={addFighter} className="showcase-form-grid">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fighter name" />
        <input value={wins} onChange={(e) => setWins(e.target.value)} placeholder="Wins" />
        <input value={losses} onChange={(e) => setLosses(e.target.value)} placeholder="Losses" />
        <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" />
        <button className="btn btn-primary" type="submit">
          Add Fighter
        </button>
      </form>
      <div className="grid columns-2">
        {fighters.map((fighter) => (
          <article className="card" key={fighter.id}>
            <h3>{fighter.name}</h3>
            <p className="muted">
              Record: {fighter.wins}-{fighter.losses}
            </p>
            <p className="muted">Region: {fighter.region}</p>
            <button className="btn btn-ghost" type="button" onClick={() => removeFighter(fighter.id)}>
              Delete
            </button>
          </article>
        ))}
      </div>
    </AppFrame>
  );
}

function OctoManagerApp() {
  const [jobs, setJobs] = useState<PrintJob[]>([
    { id: "j1", file: "gearbox-v2.gcode", printer: "Ender-3", status: "Queued", owner: "sam" },
    { id: "j2", file: "rocket-stand.gcode", printer: "Bambu P1P", status: "Printing", owner: "alex" }
  ]);
  const [file, setFile] = useState("");
  const [printer, setPrinter] = useState("");
  const [owner, setOwner] = useState("");

  const counts = useMemo(
    () =>
      jobs.reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        { Queued: 0, Printing: 0, Paused: 0, Done: 0 }
      ),
    [jobs]
  );

  function enqueue(event: FormEvent) {
    event.preventDefault();
    if (!file.trim() || !printer.trim()) return;
    setJobs((prev) => [
      {
        id: `j-${Date.now()}`,
        file: file.trim(),
        printer: printer.trim(),
        status: "Queued",
        owner: owner.trim() || "unknown"
      },
      ...prev
    ]);
    setFile("");
    setPrinter("");
    setOwner("");
  }

  function cycleStatus(id: string) {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== id) return job;
        if (job.status === "Queued") return { ...job, status: "Printing" };
        if (job.status === "Printing") return { ...job, status: "Paused" };
        if (job.status === "Paused") return { ...job, status: "Done" };
        return { ...job, status: "Queued" };
      })
    );
  }

  return (
    <AppFrame title="Icepik Octo Manager" subtitle="Integrated print queue simulator inside resume-site.">
      <div className="chip-row">
        <span className="chip">Queued: {counts.Queued}</span>
        <span className="chip">Printing: {counts.Printing}</span>
        <span className="chip">Paused: {counts.Paused}</span>
        <span className="chip">Done: {counts.Done}</span>
      </div>
      <form onSubmit={enqueue} className="showcase-form-grid">
        <input value={file} onChange={(e) => setFile(e.target.value)} placeholder="G-code file" />
        <input value={printer} onChange={(e) => setPrinter(e.target.value)} placeholder="Printer" />
        <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner" />
        <button className="btn btn-primary" type="submit">
          Queue Job
        </button>
      </form>
      <div className="grid columns-2">
        {jobs.map((job) => (
          <article className="card" key={job.id}>
            <h3>{job.file}</h3>
            <p className="muted">
              {job.printer} • {job.owner}
            </p>
            <p>Status: {job.status}</p>
            <button className="btn btn-ghost" type="button" onClick={() => cycleStatus(job.id)}>
              Advance Status
            </button>
          </article>
        ))}
      </div>
    </AppFrame>
  );
}
