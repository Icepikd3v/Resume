"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SpotifyCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      localStorage.setItem("spotify_auth_code_payload", JSON.stringify({ code, state }));
    }

    window.close();
  }, [searchParams]);

  return (
    <main style={{ padding: "1.25rem", color: "#d8f6ea", fontFamily: "sans-serif" }}>
      <p>Completing Spotify sign-in...</p>
      <p>If this window does not close automatically, you can close it manually.</p>
    </main>
  );
}
