"use client";

import { useMemo, useState } from "react";

type Track = {
  title: string;
  artist: string;
  src: string;
};

const TRACKS: Track[] = [
  {
    title: "Ambient Study 01",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Ambient Study 02",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Ambient Study 03",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export function StudioAudioPlayer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTrack = useMemo(() => TRACKS[activeIndex], [activeIndex]);

  return (
    <div className="studio-audio-shell">
      <div className="studio-audio-now">
        <p className="studio-audio-title">{activeTrack.title}</p>
        <p className="studio-audio-artist">{activeTrack.artist}</p>
      </div>

      <audio key={activeTrack.src} controls preload="none" className="studio-audio-element">
        <source src={activeTrack.src} type="audio/mpeg" />
      </audio>

      <div className="studio-tracklist" aria-label="Studio tracklist">
        {TRACKS.map((track, index) => (
          <button
            key={track.src}
            type="button"
            className={`studio-track-btn${index === activeIndex ? " is-active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            <span>{track.title}</span>
            <small>{track.artist}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
