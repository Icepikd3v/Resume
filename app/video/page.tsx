import { getSiteContent, type VideoItem } from "@/lib/content-store";

export const dynamic = "force-dynamic";

function VideoSection({
  title,
  subtitle,
  videos
}: {
  title: string;
  subtitle: string;
  videos: VideoItem[];
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <p className="section-lead">{subtitle}</p>
      <div className="video-grid">
        {videos.length === 0 ? (
          <p className="muted">No videos in this section yet.</p>
        ) : (
          videos.map((video) => (
            <article key={video.title} className="card video-card">
              <h3>{video.title}</h3>
              {video.embedUrl ? (
                <div className="video-embed-wrap">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="muted">Embed code pending.</p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function pickByTitles(videos: VideoItem[], titles: string[]) {
  const lookup = new Map(videos.map((video) => [video.title, video]));
  return titles.map((title) => lookup.get(title)).filter(Boolean) as VideoItem[];
}

export default async function VideoPage() {
  const content = await getSiteContent();
  const tutorials = content.tutorialVideos;

  const tutorSpark = pickByTitles(tutorials, [
    "TutorSparkCLI Walkthrough",
    "TutorSpark CLI UnitTesting",
    "TutorSparkCLI Milestone 1&2",
    "TutorSpark CLI basic"
  ]);

  const dataVisualization = pickByTitles(tutorials, ["Data Vizualization Presentation"]);

  const testing = pickByTitles(tutorials, [
    "JMeter Stress Testing",
    "Shell Script Newman Testing",
    "Load Testing POSTMAN",
    "Selenium Testing",
    "Integration Testing POSTMAN",
    "Unit Testing",
    "Unit Testing API POSTMAN",
    "Mongo Testing",
    "NodeJS Unit Testing",
    "API Testing"
  ]);

  const miscWalkthroughs = pickByTitles(tutorials, [
    "Auth0 Flow Progress Code",
    "Space Object Library API",
    "RESTfull routes using Express.js",
    "Docker Tutorial",
    "Framer-Motion Library",
    "Hacker Rank Challenge",
    "Full-Stack Build"
  ]);

  return (
    <div className="page-shell video-page">
      <section className="panel hero">
        <p className="eyebrow">Video</p>
        <h1>Video Library</h1>
        <p className="intro">A categorized archive of tutorials, testing demos, school walkthroughs, and project showcases.</p>
        <div className="chip-row">
          <a className="chip" href="#tutorspark">TutorSparkCLI</a>
          <a className="chip" href="#dataviz">Data Visualization</a>
          <a className="chip" href="#testing">Testing</a>
          <a className="chip" href="#misc">Misc School</a>
          <a className="chip" href="#projects">Project Videos</a>
          <a className="chip" href="#timelapse">Timelapse</a>
        </div>
      </section>

      <section id="tutorspark">
        <VideoSection
        title="TutorSparkCLI Videos"
        subtitle="TutorSpark CLI walkthroughs, milestones, and focused implementation demos."
        videos={tutorSpark}
        />
      </section>

      <section id="dataviz">
        <VideoSection
        title="Data Visualization"
        subtitle="Standalone data visualization presentation content."
        videos={dataVisualization}
        />
      </section>

      <section id="testing">
        <VideoSection
        title="Testing"
        subtitle="Unit, load, stress, API, integration, and automation testing demonstrations."
        videos={testing}
        />
      </section>

      <section id="misc">
        <VideoSection
        title="Misc School Walkthroughs"
        subtitle="Other course and technical walkthroughs (Docker, Auth0, Express routes, and more)."
        videos={miscWalkthroughs}
        />
      </section>

      <section id="projects">
        <VideoSection
        title="Project Videos"
        subtitle="Feature demos for shipped portfolio projects."
        videos={content.projectVideos}
        />
      </section>

      <section id="timelapse">
        <VideoSection
        title="3D Print Timelapse"
        subtitle="Print-lab timelapses and long-form process captures."
        videos={content.printTimelapseVideos}
        />
      </section>
    </div>
  );
}
