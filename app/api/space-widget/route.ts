import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type IssResponse = {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  velocity?: number;
  visibility?: string;
};

type SolarBodyResponse = {
  englishName?: string;
  meanRadius?: number;
  gravity?: number;
  sideralOrbit?: number;
  moons?: Array<{ moon?: string }> | null;
};

type PlanetMetric = {
  id: "earth" | "mars" | "jupiter";
  name: string;
  radiusKm: number;
  gravity: number;
  orbitDays: number;
  moons: number;
};

const PLANET_FALLBACKS: Record<PlanetMetric["id"], PlanetMetric> = {
  earth: {
    id: "earth",
    name: "Earth",
    radiusKm: 6371,
    gravity: 9.81,
    orbitDays: 365,
    moons: 1
  },
  mars: {
    id: "mars",
    name: "Mars",
    radiusKm: 3389,
    gravity: 3.71,
    orbitDays: 687,
    moons: 2
  },
  jupiter: {
    id: "jupiter",
    name: "Jupiter",
    radiusKm: 69911,
    gravity: 24.79,
    orbitDays: 4333,
    moons: 95
  }
};

function getHemisphere(latitude?: number, longitude?: number): string {
  if (typeof latitude !== "number" || typeof longitude !== "number") return "Low Earth Orbit";
  const latZone = latitude >= 0 ? "Northern" : "Southern";
  const lonZone = longitude >= 0 ? "Eastern" : "Western";
  return `${latZone} / ${lonZone}`;
}

function normalizePlanet(id: PlanetMetric["id"], body: SolarBodyResponse | null): PlanetMetric {
  const fallback = PLANET_FALLBACKS[id];

  return {
    id,
    name: body?.englishName || fallback.name,
    radiusKm: typeof body?.meanRadius === "number" ? body.meanRadius : fallback.radiusKm,
    gravity: typeof body?.gravity === "number" ? body.gravity : fallback.gravity,
    orbitDays: typeof body?.sideralOrbit === "number" ? body.sideralOrbit : fallback.orbitDays,
    moons: Array.isArray(body?.moons) ? body!.moons!.length : fallback.moons
  };
}

async function fetchPlanetById(id: string): Promise<SolarBodyResponse | null> {
  try {
    const res = await fetch(`https://api.le-systeme-solaire.net/rest/bodies/${id}`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    return (await res.json()) as SolarBodyResponse;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [issRes, earth, mars, jupiter] = await Promise.all([
      fetch("https://api.wheretheiss.at/v1/satellites/25544", { next: { revalidate: 15 } }),
      // Solar System OpenData uses French ids, Earth = "terre"
      fetchPlanetById("terre"),
      fetchPlanetById("mars"),
      fetchPlanetById("jupiter")
    ]);

    const iss = (await issRes.json()) as IssResponse;

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      iss: {
        latitude: typeof iss.latitude === "number" ? iss.latitude : 0,
        longitude: typeof iss.longitude === "number" ? iss.longitude : 0,
        altitudeKm: typeof iss.altitude === "number" ? iss.altitude : null,
        velocityKmh: typeof iss.velocity === "number" ? iss.velocity : null,
        visibility: iss.visibility ?? "unknown",
        hemisphere: getHemisphere(iss.latitude, iss.longitude)
      },
      solar: {
        source: "Solar System OpenData",
        sourceUrl: "https://api.le-systeme-solaire.net/",
        planets: [normalizePlanet("earth", earth), normalizePlanet("mars", mars), normalizePlanet("jupiter", jupiter)]
      }
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        updatedAt: new Date().toISOString(),
        message: "Mission feeds are temporarily unavailable."
      },
      { status: 200 }
    );
  }
}
