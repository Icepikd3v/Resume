import Image from "next/image";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/g, "/");
}

function extractAttribute(input: string, attribute: string) {
  const match = input.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match?.[1] ? decodeHtmlEntities(match[1]).trim() : "";
}

function extractFacebookReelUrl(input: string) {
  const normalized = input.trim();
  if (!normalized) return "";

  const source =
    normalized.startsWith("<")
      ? extractAttribute(normalized, "src") || extractAttribute(normalized, "data-href") || extractAttribute(normalized, "href")
      : decodeHtmlEntities(normalized);

  if (!source) return "";

  try {
    const url = new URL(source);
    if (!url.hostname.includes("facebook.com")) return "";

    if (url.pathname.includes("/plugins/video.php")) {
      const href = url.searchParams.get("href");
      return href ? decodeHtmlEntities(href) : "";
    }

    return url.toString();
  } catch {
    return source.includes("facebook.com") ? source : "";
  }
}

function extractFacebookReelId(input: string) {
  const reelUrl = extractFacebookReelUrl(input);
  const match = reelUrl.match(/\/reel\/(\d+)/i);
  if (match?.[1]) return match[1];

  const videoMatch = reelUrl.match(/\/videos\/(\d+)/i);
  if (videoMatch?.[1]) return videoMatch[1];
  return "";
}

export default async function S3DPrintProcessingPage() {
  const content = await getSiteContent();
  return (
    <div className="page-shell s3d-page">
      <section className="panel hero">
        <p className="eyebrow">Print Lab</p>
        <h1>3D Print & Processing</h1>
        <p className="intro">
          A focused lab page for FDM printing, OctoPrint workflows, and post-processing showcases.
        </p>
      </section>

      <section className="panel">
        <h2>3D Print and OctoPrint Lab</h2>
        <p className="section-lead">
          Physical builds, printer setups, and OctoPrint workflow snapshots that connect software with hardware
          execution.
        </p>
        <div className="photo-grid photo-grid-prints">
          {content.printGallery.map((image) => (
            <figure key={image.src} className="photo-card">
              <div className="photo-frame print-frame">
                <Image src={image.src} alt={image.label} fill sizes="(max-width: 720px) 100vw, 33vw" />
              </div>
              <figcaption>{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Facebook Reels Showcase</h2>
        <p className="section-lead">
          A direct list of 3D printing reels. Click any item to view on Facebook.
        </p>
        <div className="reel-links-wrap">
          {content.facebookReels.length === 0 ? (
            <p className="muted">No Facebook Reels added yet.</p>
          ) : (
            <ol className="reel-links-list compact-reel-list">
              {content.facebookReels.map((reel) => {
                const reelUrl = extractFacebookReelUrl(reel.embedUrl);
                const reelId = extractFacebookReelId(reel.embedUrl);
                return (
                  <li key={reel.title} className="reel-links-item">
                    <div className="reel-list-left">
                      <span className="reel-dot" aria-hidden="true">FB</span>
                      <div className="reel-meta">
                        <p className="reel-title">{reel.title}</p>
                        {reelId ? <p className="reel-id">Reel ID: {reelId}</p> : null}
                      </div>
                    </div>
                    {reelUrl ? (
                      <a href={reelUrl} target="_blank" rel="noreferrer" className="reel-inline-link">
                        View
                      </a>
                    ) : (
                      <p className="muted">Invalid or missing reel link</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
