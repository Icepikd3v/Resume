"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Track = {
  title: string;
  artist: string;
  query?: string;
};

type YTItem = {
  id?: { videoId?: string };
};

type YTSearchResponse = {
  items?: YTItem[];
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        container: string | HTMLElement,
        config: {
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: { setVolume: (v: number) => void } }) => void;
            onError?: () => void;
          };
        },
      ) => {
        loadVideoById: (videoId: string) => void;
        setVolume: (v: number) => void;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const TRACKS: Track[] = [
  { title: "Feels Like Summer", artist: "Childish Gambino" },
  { title: "Hideaway", artist: "Kiesza" },
  { title: "Lose Control (The Village Sessions)", artist: "Teddy Swims" },
  { title: "Champion", artist: "Kayne West" },
  { title: "Promises (Nero ft Skrillex Remix)", artist: "Nero / Skrillex" },
  { title: "Trading Places", artist: "Jack Harlow" },
  { title: "Losing My Way", artist: "FKJ & Tom Misch" },
  { title: "Think I'm In Love With You", artist: "Chris Stapleton" },
  {
    title: "Trust Nobody",
    artist: "Hippie Sabotage",
    query: "\"Hippie Sabotage\" \"TRUST NOBODY\" official audio",
  },
  {
    title: "Pretty Toxic Revolver",
    artist: "MGK",
    query: "\"mgk\" \"pretty toxic revolver\" official audio",
  },
];

const SAFE_VOLUME = 35;

function trackQuery(track: Track) {
  return track.query || `${track.artist} ${track.title} official audio`;
}

export function StudioAudioPlayer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<InstanceType<NonNullable<typeof window.YT>["Player"]> | null>(null);
  const apiReadyRef = useRef(false);
  const mountId = useMemo(() => `studio-yt-player-${Math.random().toString(36).slice(2)}`, []);
  const cacheRef = useRef<Record<number, string>>({});

  const activeTrack = TRACKS[activeIndex];

  useEffect(() => {
    if (window.YT?.Player) {
      apiReadyRef.current = true;
      return;
    }

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const cached = cacheRef.current[activeIndex];
    if (cached) {
      setVideoId(cached);
      return;
    }

    setLoading(true);
    const q = encodeURIComponent(trackQuery(activeTrack));
    const url = `/api/yt-search?q=${q}`;

    fetch(url)
      .then((res) => res.json())
      .then((data: YTSearchResponse) => {
        if (cancelled) return;
        const id = data?.items?.[0]?.id?.videoId;
        if (id) {
          cacheRef.current[activeIndex] = id;
          setVideoId(id);
        } else {
          setVideoId(null);
          setError("Could not find an embeddable video for this track.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVideoId(null);
          setError("Track lookup failed. Try another song in the queue.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeIndex, activeTrack]);

  useEffect(() => {
    if (!videoId || !apiReadyRef.current || !window.YT?.Player) return;

    if (!playerRef.current) {
      playerRef.current = new window.YT.Player(mountId, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          controls: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(SAFE_VOLUME);
          },
          onError: () => {
            setError("This track could not be played in the embedded player.");
          },
        },
      });
      return;
    }

    playerRef.current.loadVideoById(videoId);
    playerRef.current.setVolume(SAFE_VOLUME);
  }, [mountId, videoId]);

  return (
    <div className="studio-audio-shell">
      <div className="studio-audio-now">
        <p className="studio-audio-title">
          #{activeIndex + 1} {activeTrack.title}
        </p>
        <p className="studio-audio-artist">{activeTrack.artist}</p>
      </div>

      <div className="studio-video-frame">
        {videoId ? (
          <div id={mountId} className="studio-yt-mount" />
        ) : (
          <div className="studio-preview-fallback">
            <p>{loading ? "Loading full track..." : error || "Track unavailable."}</p>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(trackQuery(activeTrack))}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on YouTube
            </a>
          </div>
        )}
      </div>

      <div className="studio-tracklist" aria-label="Studio tracklist">
        {TRACKS.map((track, index) => (
          <button
            key={`${track.artist}-${track.title}`}
            type="button"
            className={`studio-track-btn${index === activeIndex ? " is-active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            <span>
              {index + 1}. {track.title}
            </span>
            <small>{track.artist}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
