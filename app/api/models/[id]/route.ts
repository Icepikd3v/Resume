import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, removeModel } from "@/lib/embedded-app-store";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getBearerToken(request.headers.get("authorization"));
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await removeModel(user.id, id);
  if (!ok) return NextResponse.json({ message: "Model not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
