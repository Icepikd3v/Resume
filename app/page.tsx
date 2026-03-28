import Link from "next/link";
import { PortraitShowcase } from "@/components/portrait-showcase";
import { StudioAudioPlayer } from "@/components/studio-audio-player";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.69 1.26 3.34.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.19-3.12-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.19 1.19a11 11 0 0 1 5.8 0c2.21-1.5 3.18-1.19 3.18-1.19.63 1.6.23 2.78.12 3.07.74.82 1.19 1.86 1.19 3.12 0 4.43-2.69 5.4-5.26 5.69.41.35.77 1.02.77 2.06v3.05c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.45 20.45H16.9v-5.57c0-1.33-.03-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.94v5.66H9.37V9h3.4v1.56h.05c.47-.9 1.64-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.36 7.43A2.06 2.06 0 1 1 5.36 3.3a2.06 2.06 0 0 1 0 4.12ZM7.14 20.45H3.58V9h3.56v11.45ZM22.23.5H1.76C1.06.5.5 1.07.5 1.77v20.46c0 .7.56 1.27 1.26 1.27h20.47c.7 0 1.27-.57 1.27-1.27V1.77C23.5 1.07 22.93.5 22.23.5Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2 1.1v.11l7 5.26 7-5.26V6.6h-14Zm14 2.6-5.8 4.36a2 2 0 0 1-2.4 0L5 9.2v9.3c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V9.2Z"
      />
    </svg>
  );
}

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <div className="page-shell">
      <section className="hero hero-pro hero-layout">
        <div className="top-split profile-media-row">
          <section className="panel split-left profile-pic-panel">
            <PortraitShowcase portraits={content.portraits} ownerName={content.name} />
            <h1>{content.name}</h1>
            <p className="name-alias">{content.alias}</p>
            <p className="intro">{content.headline}</p>
            <div className="hero-quick-chips" aria-label="Professional highlights">
              <span className="chip">Open to Work</span>
              <span className="chip">Remote + On-Site</span>
              <span className="chip">MERN + Automation</span>
            </div>
          </section>

          <aside className="split-right">
            <article className="panel side-card contact-compact-card">
              <h3>Connect</h3>
              <p className="muted">Professional links and direct contact.</p>
              <div className="icon-links" aria-label="Social links">
                <a href={content.socialLinks.github} target="_blank" rel="noreferrer" className="icon-link-pill">
                  <GitHubIcon />
                  <span>GitHub</span>
                </a>
                <a href={content.socialLinks.linkedin} target="_blank" rel="noreferrer" className="icon-link-pill">
                  <LinkedInIcon />
                  <span>LinkedIn</span>
                </a>
              </div>
              <div className="contact-list-compact">
                {content.contacts.map((email) => (
                  <p key={email} className="contact-row">
                    <a href={`mailto:${email}`}>{email}</a>
                  </p>
                ))}
              </div>
            </article>
          </aside>
        </div>

        <article className="panel side-card player-card" aria-label="Background player module">
          <p className="eyebrow">Studio Player</p>
          <h3>Chill Instrumental Audio</h3>
          <p className="muted">Compact audio-only player with a non-pop ambient tracklist.</p>
          <StudioAudioPlayer />
        </article>
      </section>

      <section id="about" className="panel">
        <h2>About Me</h2>
        <p># Hi, I&apos;m Samuel Farmer (aka icepikd3v)</p>
        <p>
          Full-Stack Developer | Full Sail University Alumni
          <br />
          B.S. in Web Design & Development - Full Sail University, Class of 2025
          <br />
          GPA: 3.6 | Member of the National Society of Collegiate Scholars (NSCS)
        </p>

        <h3>Tech Stack</h3>
        <ul className="detail-list">
          <li>
            <strong>Languages:</strong> JavaScript, Python, Go (Golang), Ruby, HTML, CSS, G-code
          </li>
          <li>
            <strong>Frameworks & Libraries:</strong> React, Node.js, Express, Tailwind CSS
          </li>
          <li>
            <strong>Databases:</strong> MongoDB, Firebase
          </li>
          <li>
            <strong>Tools:</strong> Git, GitHub, OctoPrint API, Raspberry Pi, AWS (EC2, S3)
          </li>
          <li>
            <strong>Other Interests:</strong> FDM 3D printing, AV editing, hardware repair
          </li>
        </ul>

        <p>{content.about}</p>
      </section>

      <section id="projects" className="panel">
        <h2>Featured Projects</h2>
        <div className="grid columns-2">
          {content.featuredProjects.map((project) => (
            <article key={project.slug} className="card">
              <p className="badge">{project.category}</p>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
              <p className="muted">{project.stack.join(" • ")}</p>
              <div className="project-links">
                <Link href={`/projects/${project.slug}`} className="inline-link">
                  Open Project Showcase
                </Link>
                <a href={project.repo}>Repository</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Live Working Sites</h2>
        <div className="grid columns-2">
          {content.liveSites.map((site) => (
            <article className="card" key={site.name + site.url}>
              <h3>{site.name}</h3>
              <p className="muted">{site.description}</p>
              <a href={site.url} target="_blank" rel="noreferrer">
                {site.url.replace(/^https?:\/\//, "")}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="ai" className="panel panel-ai">
        <h2>AI + Automation</h2>
        <p>
          I use AI as a practical engineering accelerator for prototyping, refactoring, documentation,
          and test planning. The goal is reliable delivery, faster iteration, and higher-quality systems.
        </p>
        <div className="grid columns-3">
          <article className="card">
            <h3>AI-Assisted Development</h3>
            <p className="muted">Rapid iteration on UI, backend scaffolding, and implementation planning.</p>
          </article>
          <article className="card">
            <h3>Automation First</h3>
            <p className="muted">Workflow automation for CRM, data processing, and operational consistency.</p>
          </article>
          <article className="card">
            <h3>Human-Guided Quality</h3>
            <p className="muted">Engineering judgment, review discipline, and client-focused outcomes.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <h2>S3D Print&Processing</h2>
        <p className="section-lead">Dedicated page for your 3D print and OctoPrint lab showcase.</p>
        <div className="project-links">
          <Link href="/s3d-print-processing" className="btn btn-primary">
            Open S3D Print&Processing
          </Link>
        </div>
      </section>

      <section id="contact" className="panel">
        <h2>Contact Info</h2>
        <p className="section-lead">Choose your preferred way to connect.</p>
        <div className="contact-grid">
          {content.contacts.map((email) => (
            <article key={email} className="contact-method-card">
              <div className="contact-method-head">
                <span className="contact-icon">
                  <MailIcon />
                </span>
                <h3>Email</h3>
              </div>
              <a href={`mailto:${email}`} className="contact-value">
                {email}
              </a>
            </article>
          ))}
          <article className="contact-method-card">
            <div className="contact-method-head">
              <span className="contact-icon">
                <GitHubIcon />
              </span>
              <h3>GitHub</h3>
            </div>
            <a href={content.socialLinks.github} target="_blank" rel="noreferrer" className="contact-value">
              {content.socialLinks.github.replace(/^https?:\/\//, "")}
            </a>
          </article>
          <article className="contact-method-card">
            <div className="contact-method-head">
              <span className="contact-icon">
                <LinkedInIcon />
              </span>
              <h3>LinkedIn</h3>
            </div>
            <a href={content.socialLinks.linkedin} target="_blank" rel="noreferrer" className="contact-value">
              {content.socialLinks.linkedin.replace(/^https?:\/\//, "")}
            </a>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        © {new Date().getFullYear()} {content.name} ({content.alias}) · Resume Site
      </footer>
    </div>
  );
}
