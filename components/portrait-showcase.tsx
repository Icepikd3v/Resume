"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Portrait = {
  src: string;
  label: string;
};

type Props = {
  portraits: Portrait[];
  ownerName: string;
};

export function PortraitShowcase({ portraits, ownerName }: Props) {
  const defaultIndex = useMemo(() => {
    const suitIndex = portraits.findIndex((portrait) => portrait.label.toLowerCase().includes("suit"));
    return suitIndex >= 0 ? suitIndex : 0;
  }, [portraits]);

  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const active = portraits[activeIndex];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + portraits.length) % portraits.length);
  };

  const showNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % portraits.length);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) => {
          if (current === null) return null;
          return (current - 1 + portraits.length) % portraits.length;
        });
      }

      if (event.key === "ArrowRight") {
        setLightboxIndex((current) => {
          if (current === null) return null;
          return (current + 1) % portraits.length;
        });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, portraits.length]);

  return (
    <div className="portrait-showcase">
      <div className="portrait-main-wrap">
        <button
          type="button"
          className="portrait-main-button"
          onClick={() => openLightbox(activeIndex)}
          aria-label={`Enlarge ${active.label} photo`}
        >
          <div className="photo-frame portrait-main-frame">
            <Image src={active.src} alt={`${ownerName} - ${active.label}`} fill sizes="(max-width: 720px) 100vw, 360px" />
          </div>
        </button>
        <p className="portrait-main-label">{active.label}</p>
      </div>

      {lightboxIndex !== null ? (
        <div className="lightbox-backdrop" onClick={closeLightbox} role="dialog" aria-modal="true">
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Close image">
              x
            </button>
            <button type="button" className="lightbox-arrow left" onClick={showPrev} aria-label="Previous image">
              ←
            </button>
            <div className="lightbox-image-wrap">
              <Image
                src={portraits[lightboxIndex].src}
                alt={`${ownerName} - ${portraits[lightboxIndex].label}`}
                fill
                sizes="90vw"
              />
            </div>
            <button type="button" className="lightbox-arrow right" onClick={showNext} aria-label="Next image">
              →
            </button>
            <p className="lightbox-label">{portraits[lightboxIndex].label}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
