import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent, type SiteContent } from "@/lib/content-store";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(req: Request) {
  const user = req.headers.get("x-admin-user");
  const pass = req.headers.get("x-admin-pass");
  const expectedUser = process.env.ADMIN_DASHBOARD_USERNAME || "icepik09";
  const expectedPass = process.env.ADMIN_DASHBOARD_PASSWORD || "Admin12345!";
  const allowedUsers = new Set([expectedUser, `${expectedUser}@gmail.com`]);
  return !!user && allowedUsers.has(user) && pass === expectedPass;
}

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return unauthorized();
  }

  const body = (await req.json()) as SiteContent;

  if (
    !body?.name ||
    !body?.alias ||
    !body?.headline ||
    !body?.about ||
    !Array.isArray(body?.contacts) ||
    !Array.isArray(body?.featuredProjects) ||
    !Array.isArray(body?.portraits) ||
    !Array.isArray(body?.printGallery) ||
    !Array.isArray(body?.liveSites) ||
    !Array.isArray(body?.tutorialVideos) ||
    !Array.isArray(body?.projectVideos) ||
    !Array.isArray(body?.printTimelapseVideos) ||
    !body?.socialLinks?.github ||
    !body?.socialLinks?.linkedin
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await saveSiteContent(body);
  return NextResponse.json({ ok: true });
}
