import { NextRequest, NextResponse } from "next/server";
import { removeCharacterSubmission } from "@/lib/embedded-app-store";

const GUEST_OWNER_ID = "guest-rick";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await removeCharacterSubmission(GUEST_OWNER_ID, id);
  if (!ok) return NextResponse.json({ message: "Submission not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
