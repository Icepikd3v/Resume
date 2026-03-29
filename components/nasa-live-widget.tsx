"use client";

import { useEffect, useState } from "react";

type NasaWidgetData = {
  ok: boolean;
  updatedAt: string;
  apod?: {
    title: string;
    date: string;
    url: string;
  };
  neo?: {
    count: number;
    closestName: string;
    closestMissKm: number | null;
  };
  message?: string;
};

export function NasaLiveWidget() {
  const [data, setData] = useState<NasaWidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/nasa-widget", { cache: "no-store" });
        const json = (await res.json()) as NasaWidgetData;
        if (active) {
          setData(json);
        }
      } catch {
        if (active) {
          setData({ ok: false, updatedAt: new Date().toISOString(), message: "Unable to load NASA live feed." });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    const id = setInterval(load, 300000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="nasa-widget">
      <p className="eyebrow">Quick Widget</p>
      <h3>NASA Live Feed</h3>
      <p className="muted">Real-time space snapshot from NASA APIs with periodic refresh.</p>

      <div className="nasa-status-row" aria-live="polite">
        <span className="nasa-status-dot" />
        <strong>{loading ? "Syncing NASA data..." : data?.ok ? "Live Data Active" : "Degraded Feed"}</strong>
      </div>

      <div className="nasa-grid">
        <article className="nasa-stat">
          <span>APOD</span>
          <strong>{data?.apod?.date ?? "--"}</strong>
          <p>{data?.apod?.title ?? "Loading astronomy picture title..."}</p>
        </article>

        <article className="nasa-stat">
          <span>Near-Earth Objects (Today)</span>
          <strong>{typeof data?.neo?.count === "number" ? data.neo.count : "--"}</strong>
          <p>
            {data?.neo?.closestName
              ? `Closest: ${data.neo.closestName}${
                  data.neo.closestMissKm ? ` (${Math.round(data.neo.closestMissKm).toLocaleString()} km)` : ""
                }`
              : "Tracking nearest approach..."}
          </p>
        </article>
      </div>

      <div className="widget-tag-row">
        <span className="chip">APOD</span>
        <span className="chip">NeoWs</span>
      </div>

      <p className="nasa-footnote">
        {data?.apod?.url ? (
          <a href={data.apod.url} target="_blank" rel="noreferrer">
            Open Today&apos;s NASA Media
          </a>
        ) : (
          data?.message ?? "Waiting for response..."
        )}
      </p>
    </div>
  );
}
