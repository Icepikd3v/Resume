import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, issueToken } from "@/lib/embedded-app-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = String(body?.username || body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }
  if (await findUserByEmail(email)) {
    return NextResponse.json({ message: "User already exists" }, { status: 409 });
  }

  const user = await createUser({ username, email, password });
  const token = issueToken(user.id);
  return NextResponse.json(
    {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        subscriptionTier: user.subscriptionTier || "basic"
      }
    },
    { status: 201 }
  );
}
