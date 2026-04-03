import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name") || "";
  const page = request.nextUrl.searchParams.get("page") || "1";
  if (!name.trim()) {
    return NextResponse.json({ message: "Query name is required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(name)}&page=${encodeURIComponent(page)}`,
      { cache: "no-store" }
    );
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(payload || { message: "Search upstream failed" }, { status: upstream.status });
    }
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ message: "Failed to fetch Rick and Morty API" }, { status: 502 });
  }
}
