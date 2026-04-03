import { NextRequest, NextResponse } from "next/server";
import { addCharacterSubmission, listCharacterSubmissions } from "@/lib/embedded-app-store";

const GUEST_OWNER_ID = "guest-rick";

export async function GET(request: NextRequest) {
  return NextResponse.json(await listCharacterSubmissions(GUEST_OWNER_ID));
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let payload: Record<string, FormDataEntryValue | string> = {};

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    form.forEach((value, key) => {
      payload[key] = value;
    });
  } else {
    payload = await request.json().catch(() => ({}));
  }

  const imageEntry = payload.image;
  const imageUrl =
    imageEntry && typeof imageEntry !== "string"
      ? `/embedded/rick-and-morty-react/logo192.png`
      : String(payload.imageUrl || "");

  const item = await addCharacterSubmission(GUEST_OWNER_ID, {
    name: String(payload.name || "Unknown"),
    status: String(payload.status || "Unknown"),
    species: String(payload.species || "Unknown"),
    gender: String(payload.gender || "Unknown"),
    origin: String(payload.origin || "Unknown"),
    location: String(payload.location || "Unknown"),
    email: String(payload.email || ""),
    imageUrl
  });

  return NextResponse.json(item, { status: 201 });
}
