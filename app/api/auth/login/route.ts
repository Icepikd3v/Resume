import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, issueToken, verifyUserPassword } from "@/lib/embedded-app-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const user = await findUserByEmail(email);
  const passwordOk = user ? await verifyUserPassword(user, password) : false;
  if (!user || !passwordOk) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
  const token = issueToken(user.id);
  return NextResponse.json({
    token,
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
