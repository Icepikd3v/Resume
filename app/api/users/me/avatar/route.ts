import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, updateUser } from "@/lib/embedded-app-store";

export async function POST(request: NextRequest) {
  const token = getBearerToken(request.headers.get("authorization"));
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("avatar");
  const fallbackAvatar = "/embedded/icepik-octo-manager/logo192.png";
  const avatarUrl = file ? fallbackAvatar : user.avatarUrl || fallbackAvatar;
  const next = await updateUser(user.id, { avatarUrl });

  return NextResponse.json({
    user: {
      id: next?.id || user.id,
      username: next?.username || user.username,
      email: next?.email || user.email,
      bio: next?.bio || "",
      avatarUrl: next?.avatarUrl || avatarUrl,
      subscriptionTier: next?.subscriptionTier || "basic"
    }
  });
}
