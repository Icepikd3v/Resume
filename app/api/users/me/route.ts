import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, updateUser } from "@/lib/embedded-app-store";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request.headers.get("authorization"));
  const user = await getUserFromToken(token);
  if (!user) return unauthorized();
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
      subscriptionTier: user.subscriptionTier || "basic"
    }
  });
}

export async function PATCH(request: NextRequest) {
  const token = getBearerToken(request.headers.get("authorization"));
  const user = await getUserFromToken(token);
  if (!user) return unauthorized();
  const body = await request.json().catch(() => ({}));
  const next = await updateUser(user.id, {
    username: body?.username ? String(body.username) : user.username,
    email: body?.email ? String(body.email).trim().toLowerCase() : user.email,
    bio: body?.bio !== undefined ? String(body.bio) : user.bio || ""
  });
  return NextResponse.json({
    user: {
      id: next?.id || user.id,
      username: next?.username || user.username,
      email: next?.email || user.email,
      bio: next?.bio || "",
      avatarUrl: next?.avatarUrl || "",
      subscriptionTier: next?.subscriptionTier || "basic"
    }
  });
}
