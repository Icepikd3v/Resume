import Image from "next/image";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function S3DPrintProcessingPage() {
  const content = await getSiteContent();
  return (
    <div className="page-shell s3d-page">
      <section className="panel hero">
        <p className="eyebrow">S3D Print&Processing</p>
        <h1>S3D Print&Processing</h1>
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
    </div>
  );
}
