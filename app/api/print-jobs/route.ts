import { NextRequest, NextResponse } from "next/server";
import { addPrintJob, getBearerToken, getUserFromToken } from "@/lib/embedded-app-store";

export async function POST(request: NextRequest) {
  const token = getBearerToken(request.headers.get("authorization"));
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const printer = String(body?.printer || "EnderDirect");
  const filename = String(body?.filename || "queued-model.gcode");
  const job = await addPrintJob({ ownerId: user.id, printer, filename });
  return NextResponse.json(job, { status: 201 });
}
