import { NextResponse } from "next/server";
import {
  deleteBlogPost,
  getBlogPosts,
  getBlogStoreStatus,
  saveBlogPost
} from "@/lib/blog-store";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request) {
  const user = req.headers.get("x-admin-user");
  const pass = req.headers.get("x-admin-pass");
  const expectedUser = process.env.ADMIN_DASHBOARD_USERNAME || "icepik09";
  const expectedPass = process.env.ADMIN_DASHBOARD_PASSWORD || "Admin12345!";
  const allowedUsers = new Set([expectedUser, `${expectedUser}@gmail.com`]);
  return !!user && allowedUsers.has(user) && pass === expectedPass;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const [posts, storage] = await Promise.all([getBlogPosts(), getBlogStoreStatus()]);
  return NextResponse.json({ posts, storage });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return unauthorized();
  }

  try {
    const post = await saveBlogPost(await req.json());
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save post.";
    // A missing title is the author's problem; a missing database is not.
    const status = message.includes("title") ? 400 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) {
    return unauthorized();
  }

  const slug = new URL(req.url).searchParams.get("slug") || "";

  try {
    const removed = await deleteBlogPost(slug);
    if (!removed) {
      return NextResponse.json({ error: "No post with that slug." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete post.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
