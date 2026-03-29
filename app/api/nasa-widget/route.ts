import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ApodResponse = {
  title?: string;
  date?: string;
  url?: string;
  media_type?: string;
};

type NeoObject = {
  name?: string;
  close_approach_data?: Array<{
    miss_distance?: {
      kilometers?: string;
    };
  }>;
};

type NeoFeedResponse = {
  near_earth_objects?: Record<string, NeoObject[]>;
};

export async function GET() {
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const today = new Date().toISOString().slice(0, 10);

  try {
    const [apodRes, neoRes] = await Promise.all([
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, { next: { revalidate: 300 } }),
      fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`,
        { next: { revalidate: 300 } }
      )
    ]);

    const apodJson = (await apodRes.json()) as ApodResponse;
    const neoJson = (await neoRes.json()) as NeoFeedResponse;

    const neos = neoJson.near_earth_objects?.[today] ?? [];

    const closest = neos.reduce<{ name: string; missKm: number | null } | null>((acc, item) => {
      const kmRaw = item.close_approach_data?.[0]?.miss_distance?.kilometers;
      const km = kmRaw ? Number(kmRaw) : NaN;
      if (!Number.isFinite(km)) {
        return acc;
      }
      if (!acc || km < (acc.missKm ?? Number.POSITIVE_INFINITY)) {
        return { name: item.name ?? "Unnamed object", missKm: km };
      }
      return acc;
    }, null);

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      apod: {
        title: apodJson.title ?? "Astronomy Picture of the Day",
        date: apodJson.date ?? today,
        url: apodJson.url ?? "https://science.nasa.gov/",
        mediaType: apodJson.media_type ?? "image"
      },
      neo: {
        count: neos.length,
        closestName: closest?.name ?? "No close approaches listed",
        closestMissKm: closest?.missKm ?? null
      }
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        updatedAt: new Date().toISOString(),
        message: "NASA feed unavailable right now."
      },
      { status: 200 }
    );
  }
}
