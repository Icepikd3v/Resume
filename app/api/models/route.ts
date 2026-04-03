import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, listModels } from "@/lib/embedded-app-store";

export async function GET(request: NextRequest) {
  const token = getBearerToken(request.headers.get("authorization"));
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listModels(user.id));
}
