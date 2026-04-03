import { NextRequest, NextResponse } from "next/server";
import { addModel, getBearerToken, getUserFromToken } from "@/lib/embedded-app-store";

export async function POST(request: NextRequest) {
  const token = getBearerToken(request.headers.get("authorization"));
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const printer = String(form.get("printer") || "EnderDirect");
  const filename = file && typeof file !== "string" ? file.name : "upload.gcode";
  const model = await addModel({ ownerId: user.id, filename, printer });

  return NextResponse.json({ ok: true, model }, { status: 201 });
}
