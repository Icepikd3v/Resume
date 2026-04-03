import { NextRequest, NextResponse } from "next/server";
import {
  addUfcFighter,
  createUser,
  findUserByEmail,
  getUfcFighterById,
  issueToken,
  listUfcFighters,
  removeUfcFighter,
  updateUfcFighter,
  verifyUserPassword
} from "@/lib/embedded-app-store";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function routeParts(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  return parts.slice(3); // /api/ufc/v1/...
}

export async function GET(request: NextRequest) {
  const parts = routeParts(request);

  if (parts[0] === "health") {
    return json({ ok: true, service: "ufc-embedded-api" });
  }

  if (parts[0] === "fighters" && parts[1] === "sync" && parts[2] === "status") {
    return json({ autoSyncEnabled: false, intervalMinutes: 360 });
  }

  if (parts[0] === "fighters" && parts.length === 1) {
    return json(await listUfcFighters());
  }

  if (parts[0] === "fighters" && parts[1]) {
    const fighter = await getUfcFighterById(parts[1]);
    if (!fighter) return json({ message: "Not found" }, 404);
    return json(fighter);
  }

  return json({ message: "Not found" }, 404);
}

export async function POST(request: NextRequest) {
  const parts = routeParts(request);
  const body = await request.json().catch(() => ({}));

  if (parts[0] === "auth" && parts[1] === "signup") {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    if (!email || !password) return json({ message: "Email and password are required" }, 400);
    if (await findUserByEmail(email)) return json({ message: "User already exists" }, 409);

    const user = await createUser({
      username: String(body?.firstName || "").trim() || email.split("@")[0],
      email,
      password
    });
    const token = issueToken(user.id);
    return json({ token, user: { email: user.email, firstName: String(body?.firstName || ""), lastName: String(body?.lastName || "") } }, 201);
  }

  if (parts[0] === "auth" && parts[1] === "signin") {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const user = await findUserByEmail(email);
    const passwordOk = user ? await verifyUserPassword(user, password) : false;
    if (!user || !passwordOk) {
      return json({ message: "Invalid credentials" }, 401);
    }
    const token = issueToken(user.id);
    return json({ token, user: { email: user.email, firstName: "", lastName: "" } });
  }

  if (parts[0] === "fighters" && parts[1] === "sync") {
    return json({ ok: true, imported: 0, updated: 0, totalReceived: 0 });
  }

  if (parts[0] === "fighters" && parts.length === 1) {
    const fighter = await addUfcFighter({
      name: String(body?.name || "Unnamed Fighter"),
      region: String(body?.region || "Unknown"),
      league: String(body?.league || "UFC"),
      record: {
        wins: Number(body?.record?.wins ?? body?.wins ?? 0),
        losses: Number(body?.record?.losses ?? body?.losses ?? 0)
      },
      ownerId: "guest-ufc"
    });
    return json(fighter, 201);
  }

  return json({ message: "Not found" }, 404);
}

export async function PATCH(request: NextRequest) {
  const parts = routeParts(request);
  if (parts[0] !== "fighters" || !parts[1]) return json({ message: "Not found" }, 404);
  const body = await request.json().catch(() => ({}));
  const existing = await getUfcFighterById(parts[1]);
  if (!existing) return json({ message: "Not found" }, 404);
  const fighter = await updateUfcFighter(parts[1], {
    name: String(body?.name ?? existing.name),
    region: String(body?.region ?? existing.region),
    league: String(body?.league ?? existing.league),
    record: {
      wins: Number(body?.record?.wins ?? existing.record.wins),
      losses: Number(body?.record?.losses ?? existing.record.losses)
    }
  });
  return json(fighter);
}

export async function DELETE(request: NextRequest) {
  const parts = routeParts(request);
  if (parts[0] !== "fighters" || !parts[1]) return json({ message: "Not found" }, 404);
  const ok = await removeUfcFighter(parts[1]);
  if (!ok) return json({ message: "Not found" }, 404);
  return json({ ok: true });
}
