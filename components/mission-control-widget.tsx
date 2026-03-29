"use client";

import { useEffect, useMemo, useState } from "react";

type PlanetId = "earth" | "mars" | "jupiter";
type PlanetFilter = "all" | PlanetId;

type SpaceWidgetData = {
  ok: boolean;
  updatedAt: string;
  iss?: {
    latitude: number;
    longitude: number;
    altitudeKm: number | null;
    velocityKmh: number | null;
    visibility?: string;
    hemisphere: string;
  };
  solar?: {
    source: string;
    sourceUrl?: string;
    planets: Array<{
      id: PlanetId;
      name: string;
      radiusKm: number | null;
      gravity: number | null;
      orbitDays: number | null;
      moons: number;
    }>;
  };
  message?: string;
};

const REFRESH_MS = 30000;

function formatCoord(value?: number, axis: "lat" | "lon" = "lat"): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const abs = Math.abs(value).toFixed(2);
  const suffix = axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${abs}° ${suffix}`;
}

function planetClass(id: PlanetId) {
  if (id === "earth") return "planet-orb planet-earth";
  if (id === "mars") return "planet-orb planet-mars";
  return "planet-orb planet-jupiter";
}

export function MissionControlWidget() {
  const [data, setData] = useState<SpaceWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [planetFilter, setPlanetFilter] = useState<PlanetFilter>("all");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/space-widget", { cache: "no-store" });
        const json = (await res.json()) as SpaceWidgetData;
        if (active) {
          setData(json);
        }
      } catch {
        if (active) {
          setData({
            ok: false,
            updatedAt: new Date().toISOString(),
            message: "Unable to reach live space feeds right now."
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const refreshId = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(refreshId);
    };
  }, []);

  const visiblePlanets = useMemo(() => {
    const planets = data?.solar?.planets || [];
    if (planetFilter === "all") return planets;
    return planets.filter((planet) => planet.id === planetFilter);
  }, [data?.solar?.planets, planetFilter]);

  return (
    <div className="mission-widget">
      <p className="eyebrow">Quick Widget</p>
      <h3>Solar System Live</h3>
      <p className="muted">ISS telemetry plus live Solar System OpenData technical metrics and visuals.</p>

      <div className="mission-status" aria-live="polite">
        <span className="mission-status-dot" />
        <strong>{loading ? "Syncing orbital feeds..." : data?.ok ? "Deep-Space Link Active" : "Signal Degraded"}</strong>
      </div>

      <div className="mission-grid">
        <article className="mission-card mission-iss">
          <div className="mission-card-head">
            <span>ISS Live Tracker</span>
            <strong>{data?.iss?.hemisphere ?? "Orbit"}</strong>
          </div>
          <p>
            <span>Latitude</span>
            <strong>{formatCoord(data?.iss?.latitude, "lat")}</strong>
          </p>
          <p>
            <span>Longitude</span>
            <strong>{formatCoord(data?.iss?.longitude, "lon")}</strong>
          </p>
          <p>
            <span>Velocity</span>
            <strong>
              {typeof data?.iss?.velocityKmh === "number"
                ? `${Math.round(data.iss.velocityKmh).toLocaleString()} km/h`
                : "--"}
            </strong>
          </p>
        </article>

        <article className="mission-card mission-solar">
          <div className="mission-card-head">
            <span>Solar System OpenData</span>
            <strong>Technical Feed</strong>
          </div>

          <div className="planet-filter-row" role="tablist" aria-label="Planet focus">
            <button
              type="button"
              className={`planet-filter-btn${planetFilter === "all" ? " is-active" : ""}`}
              onClick={() => setPlanetFilter("all")}
              aria-selected={planetFilter === "all"}
            >
              All
            </button>
            <button
              type="button"
              className={`planet-filter-btn${planetFilter === "earth" ? " is-active" : ""}`}
              onClick={() => setPlanetFilter("earth")}
              aria-selected={planetFilter === "earth"}
            >
              Earth
            </button>
            <button
              type="button"
              className={`planet-filter-btn${planetFilter === "mars" ? " is-active" : ""}`}
              onClick={() => setPlanetFilter("mars")}
              aria-selected={planetFilter === "mars"}
            >
              Mars
            </button>
            <button
              type="button"
              className={`planet-filter-btn${planetFilter === "jupiter" ? " is-active" : ""}`}
              onClick={() => setPlanetFilter("jupiter")}
              aria-selected={planetFilter === "jupiter"}
            >
              Jupiter
            </button>
          </div>

          <div className="planet-grid">
            {visiblePlanets.map((planet) => (
              <div key={planet.id} className="planet-tile">
                <div className={planetClass(planet.id)} aria-hidden="true" />
                <div className="planet-meta">
                  <p className="planet-name">{planet.name}</p>
                  <p>Radius: {planet.radiusKm ? `${Math.round(planet.radiusKm).toLocaleString()} km` : "--"}</p>
                  <p>Gravity: {planet.gravity ? `${planet.gravity.toFixed(2)} m/s²` : "--"}</p>
                  <p>Orbit: {planet.orbitDays ? `${Math.round(planet.orbitDays)} days` : "--"}</p>
                  <p>Moons: {planet.moons}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="widget-tag-row">
        <span className="chip">ISS</span>
        <span className="chip">Solar System OpenData</span>
        <span className="chip">Live API</span>
      </div>

      <p className="mission-footnote">{data?.solar?.source ? `${data.solar.source} technical dataset synced.` : data?.message ?? "Waiting for feed..."}</p>
    </div>
  );
}
