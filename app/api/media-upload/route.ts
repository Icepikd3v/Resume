import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

function isAuthorized(req: Request) {
  const user = req.headers.get("x-admin-user");
  const pass = req.headers.get("x-admin-pass");
  const expectedUser = process.env.ADMIN_DASHBOARD_USERNAME || "icepik09";
  const expectedPass = process.env.ADMIN_DASHBOARD_PASSWORD || "Memorial24!";
  const allowedUsers = new Set([expectedUser, `${expectedUser}@gmail.com`]);
  return !!user && allowedUsers.has(user) && pass === expectedPass;
}

function sanitizeFilename(name: string) {
  const trimmed = name.trim().toLowerCase();
  return trimmed.replace(/[^a-z0-9._-]/g, "-");
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const folder = String(formData.get("folder") || "");
  const file = formData.get("file");

  if (!(file instanceof File) || !folder) {
    return NextResponse.json({ error: "Missing file or folder" }, { status: 400 });
  }

  const subfolder = folder === "portraits" ? "portraits" : folder === "prints" ? "prints" : "";
  if (!subfolder) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const original = sanitizeFilename(file.name || "upload.jpg");
  const ext = path.extname(original) || ".jpg";
  const base = path.basename(original, ext) || "upload";
  const filename = `${base}-${Date.now()}${ext}`;

  const targetDir = path.join(process.cwd(), "public", "uploads", subfolder);
  await fs.mkdir(targetDir, { recursive: true });

  const targetPath = path.join(targetDir, filename);
  await fs.writeFile(targetPath, buffer);

  return NextResponse.json({ src: `/uploads/${subfolder}/${filename}` });
}
