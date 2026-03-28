"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "spotify_auth_v1";
const SPOTIFY_PLAYER_NAME = "Resume Site Player";
const PLAYLIST_URI = "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M";
const TOKEN_REFRESH_BUFFER_MS = 60_000;

type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type SpotifyTrack = {
  name: string;
  artists: Array<{ name: string }>;
  album: { images: Array<{ url: string }> };
  duration_ms: number;
};

type SpotifyPlayerState = {
  paused: boolean;
  position: number;
  track_window: { current_track: SpotifyTrack };
};

type SpotifyPlayerInstance = {
  addListener: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback?: (...args: any[]) => void) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  setVolume: (volume: number) => Promise<void>;
  togglePlay: () => Promise<void>;
};

declare global {
  interface Window {
    Spotify?: {
      Player: new (options: {
        name: string;
        volume?: number;
        getOAuthToken: (cb: (token: string) => void) => void;
      }) => SpotifyPlayerInstance;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

function toBase64Url(bytes: Uint8Array) {
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

async function createCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toBase64Url(new Uint8Array(digest));
}

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredAuth(auth: StoredAuth | null) {
  if (!auth) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

async function spotifyTokenRequest(params: URLSearchParams) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token request failed: ${text || res.status}`);
  }
  return res.json();
}

async function spotifyApi(url: string, token: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify API failed (${res.status}): ${text || "unknown error"}`);
  }
  return res;
}

export function SpotifyFullPlayer() {
  const searchParams = useSearchParams();
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<SpotifyPlayerInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [positionMs, setPositionMs] = useState(0);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
  const redirectUri = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${window.location.pathname}`;
  }, []);

  useEffect(() => {
    setAuth(readStoredAuth());
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state || !clientId || !redirectUri) return;

    const expectedState = localStorage.getItem("spotify_auth_state");
    const verifier = localStorage.getItem("spotify_code_verifier");
    if (!expectedState || expectedState !== state || !verifier) {
      setError("Spotify login validation failed. Try connecting again.");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const tokenJson = await spotifyTokenRequest(
          new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
          }),
        );

        const stored: StoredAuth = {
          accessToken: tokenJson.access_token,
          refreshToken: tokenJson.refresh_token,
          expiresAt: Date.now() + tokenJson.expires_in * 1000,
        };

        if (!cancelled) {
          writeStoredAuth(stored);
          setAuth(stored);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Spotify authorization failed.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, redirectUri, searchParams]);

  useEffect(() => {
    if (!auth || !clientId) return;
    if (Date.now() < auth.expiresAt - TOKEN_REFRESH_BUFFER_MS) return;

    let cancelled = false;

    (async () => {
      try {
        const tokenJson = await spotifyTokenRequest(
          new URLSearchParams({
            client_id: clientId,
            grant_type: "refresh_token",
            refresh_token: auth.refreshToken,
          }),
        );

        const refreshed: StoredAuth = {
          accessToken: tokenJson.access_token,
          refreshToken: tokenJson.refresh_token || auth.refreshToken,
          expiresAt: Date.now() + tokenJson.expires_in * 1000,
        };

        if (!cancelled) {
          writeStoredAuth(refreshed);
          setAuth(refreshed);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Spotify token refresh failed.");
          writeStoredAuth(null);
          setAuth(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth, clientId]);

  useEffect(() => {
    if (!auth?.accessToken) return;
    if (!window.Spotify) {
      const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    let mounted = true;
    let sdkPlayer: SpotifyPlayerInstance | null = null;

    const initPlayer = () => {
      if (!window.Spotify || !mounted) return;

      sdkPlayer = new window.Spotify.Player({
        name: SPOTIFY_PLAYER_NAME,
        volume: 0.5,
        getOAuthToken: (cb) => cb(auth.accessToken),
      });

      sdkPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
        if (!mounted) return;
        setDeviceId(device_id);
      });

      sdkPlayer.addListener("player_state_changed", (state: SpotifyPlayerState | null) => {
        if (!mounted || !state) return;
        setIsPaused(state.paused);
        setPositionMs(state.position);
        setTrack(state.track_window.current_track);
      });

      sdkPlayer.addListener("authentication_error", ({ message }: { message: string }) => {
        setError(message);
      });

      sdkPlayer.addListener("account_error", ({ message }: { message: string }) => {
        setError(message);
      });

      sdkPlayer
        .connect()
        .then(() => {
          if (!mounted || !sdkPlayer) return;
          setPlayer(sdkPlayer);
          return sdkPlayer.setVolume(0.5);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Spotify player connection failed."));
    };

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      mounted = false;
      if (sdkPlayer) {
        sdkPlayer.disconnect();
      }
      setPlayer(null);
      setDeviceId(null);
    };
  }, [auth?.accessToken]);

  useEffect(() => {
    if (!auth?.accessToken || !deviceId) return;

    let cancelled = false;

    (async () => {
      try {
        await spotifyApi("https://api.spotify.com/v1/me/player", auth.accessToken, {
          method: "PUT",
          body: JSON.stringify({ device_ids: [deviceId], play: true }),
        });

        await spotifyApi(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, auth.accessToken, {
          method: "PUT",
          body: JSON.stringify({
            context_uri: PLAYLIST_URI,
            offset: { position: 0 },
            position_ms: 0,
          }),
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to start Spotify playback.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth?.accessToken, deviceId]);

  const connectSpotify = async () => {
    if (!clientId || !redirectUri) {
      setError("Missing NEXT_PUBLIC_SPOTIFY_CLIENT_ID in environment.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const verifier = randomString(96);
      const challenge = await createCodeChallenge(verifier);
      const state = randomString(16);

      localStorage.setItem("spotify_code_verifier", verifier);
      localStorage.setItem("spotify_auth_state", state);

      const scope = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
      ].join(" ");

      const url = new URL("https://accounts.spotify.com/authorize");
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("scope", scope);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("state", state);
      url.searchParams.set("code_challenge_method", "S256");
      url.searchParams.set("code_challenge", challenge);

      window.location.assign(url.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Spotify connection.");
      setIsLoading(false);
    }
  };

  const clearSpotify = () => {
    writeStoredAuth(null);
    localStorage.removeItem("spotify_code_verifier");
    localStorage.removeItem("spotify_auth_state");
    player?.disconnect();
    setPlayer(null);
    setDeviceId(null);
    setTrack(null);
    setAuth(null);
    setError(null);
  };

  const togglePlay = async () => {
    if (!player) return;
    try {
      await player.togglePlay();
      const next = await player.getCurrentState();
      if (next) {
        setIsPaused(next.paused);
        setPositionMs(next.position);
        setTrack(next.track_window.current_track);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to toggle playback.");
    }
  };

  const skip = async (direction: "next" | "previous") => {
    if (!auth?.accessToken || !deviceId) return;
    const endpoint =
      direction === "next"
        ? `https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`
        : `https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`;

    try {
      await spotifyApi(endpoint, auth.accessToken, { method: "POST" });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to skip ${direction}.`);
    }
  };

  return (
    <div className="spotify-player-shell">
      {!auth ? (
        <button type="button" className="btn btn-primary spotify-connect-btn" onClick={connectSpotify} disabled={isLoading}>
          {isLoading ? "Connecting Spotify..." : "Connect Spotify For Full Tracks"}
        </button>
      ) : (
        <>
          <div className="spotify-now-playing">
            <div className="spotify-track-meta">
              <p className="spotify-track-title">{track?.name || "Starting playback..."}</p>
              <p className="spotify-track-artist">{track?.artists?.map((artist) => artist.name).join(", ") || "Spotify"}</p>
            </div>
            <div className="spotify-track-time">
              <span>{formatMs(positionMs)}</span>
              <span>{track ? formatMs(track.duration_ms) : "--:--"}</span>
            </div>
          </div>

          <div className="spotify-controls">
            <button type="button" className="player-btn" onClick={() => skip("previous")} aria-label="Previous">
              ‹‹
            </button>
            <button type="button" className="player-btn player-btn-main" onClick={togglePlay} aria-label="Play or pause">
              {isPaused ? "▶" : "❚❚"}
            </button>
            <button type="button" className="player-btn" onClick={() => skip("next")} aria-label="Next">
              ››
            </button>
          </div>

          <button type="button" className="btn btn-ghost spotify-disconnect-btn" onClick={clearSpotify}>
            Disconnect Spotify
          </button>
        </>
      )}

      {error ? <p className="spotify-error">{error}</p> : null}
      <p className="spotify-note">Full playback requires an authenticated Spotify Premium account.</p>
    </div>
  );
}
