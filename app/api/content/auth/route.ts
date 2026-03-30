import { NextResponse } from "next/server";

function isAuthorized(req: Request) {
  const user = req.headers.get("x-admin-user");
  const pass = req.headers.get("x-admin-pass");
  const expectedUser = process.env.ADMIN_DASHBOARD_USERNAME || "icepik09";
  const expectedPass = process.env.ADMIN_DASHBOARD_PASSWORD || "Admin12345!";
  const allowedUsers = new Set([expectedUser, `${expectedUser}@gmail.com`]);
  return !!user && allowedUsers.has(user) && pass === expectedPass;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
