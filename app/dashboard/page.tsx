"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FeaturedProject = {
  slug: string;
  name: string;
  summary: string;
  stack: string[];
  repo: string;
  category: string;
};

type MediaItem = {
  src: string;
  label: string;
};

type LiveSite = {
  name: string;
  url: string;
  description: string;
};

type VideoItem = {
  title: string;
  embedUrl: string;
};

type SiteContent = {
  name: string;
  alias: string;
  headline: string;
  about: string;
  contacts: string[];
  socialLinks: {
    github: string;
    linkedin: string;
  };
  featuredProjects: FeaturedProject[];
  portraits: MediaItem[];
  printGallery: MediaItem[];
  liveSites: LiveSite[];
  tutorialVideos: VideoItem[];
  projectVideos: VideoItem[];
  printTimelapseVideos: VideoItem[];
  facebookReels: VideoItem[];
};

type ProjectDraft = {
  slug: string;
  name: string;
  summary: string;
  stackText: string;
  repo: string;
  category: string;
};

type MediaGroup = "portraits" | "printGallery";
type VideoGroup = "tutorialVideos" | "projectVideos" | "printTimelapseVideos" | "facebookReels";

type ListKey =
  | "portraits"
  | "printGallery"
  | "featuredProjects"
  | "liveSites"
  | "tutorialVideos"
  | "projectVideos"
  | "printTimelapseVideos"
  | "facebookReels";

const ITEMS_PER_PAGE = 10;

const INITIAL_SECTION_PAGES: Record<ListKey, number> = {
  portraits: 1,
  printGallery: 1,
  featuredProjects: 1,
  liveSites: 1,
  tutorialVideos: 1,
  projectVideos: 1,
  printTimelapseVideos: 1,
  facebookReels: 1
};

const defaultContent: SiteContent = {
  name: "",
  alias: "",
  headline: "",
  about: "",
  contacts: ["", ""],
  socialLinks: {
    github: "",
    linkedin: ""
  },
  featuredProjects: [],
  portraits: [],
  printGallery: [],
  liveSites: [],
  tutorialVideos: [],
  projectVideos: [],
  printTimelapseVideos: [],
  facebookReels: []
};

function normalizeContent(raw: Partial<SiteContent>): SiteContent {
  return {
    name: raw.name || "",
    alias: raw.alias || "",
    headline: raw.headline || "",
    about: raw.about || "",
    contacts: Array.isArray(raw.contacts) && raw.contacts.length ? raw.contacts : ["", ""],
    socialLinks: {
      github: raw.socialLinks?.github || "",
      linkedin: raw.socialLinks?.linkedin || ""
    },
    featuredProjects: Array.isArray(raw.featuredProjects) ? raw.featuredProjects : [],
    portraits: Array.isArray(raw.portraits) ? raw.portraits : [],
    printGallery: Array.isArray(raw.printGallery) ? raw.printGallery : [],
    liveSites: Array.isArray(raw.liveSites) ? raw.liveSites : [],
    tutorialVideos: Array.isArray(raw.tutorialVideos) ? raw.tutorialVideos : [],
    projectVideos: Array.isArray(raw.projectVideos) ? raw.projectVideos : [],
    printTimelapseVideos: Array.isArray(raw.printTimelapseVideos) ? raw.printTimelapseVideos : [],
    facebookReels: Array.isArray(raw.facebookReels) ? raw.facebookReels : []
  };
}

function getLiveSitePreview(site: LiveSite): string {
  const name = site.name.toLowerCase().replace(/\s+/g, "");
  const url = site.url.toLowerCase();

  if (name.includes("elysium") || url.includes("elysiummall.com")) {
    return "/Elysiummall.com.png";
  }

  if (name.includes("mybrothersfinds") || url.includes("mybrothersfinds.com")) {
    return "/MyBrothersFinds.com.png";
  }

  return "/Elysiummall.com.png";
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const normalized = url.trim();

  const embedMatch = normalized.match(/youtube\.com\/embed\/([^?&#/]+)/i);
  if (embedMatch?.[1]) return embedMatch[1];

  const watchMatch = normalized.match(/[?&]v=([^?&#]+)/i);
  if (watchMatch?.[1]) return watchMatch[1];

  const shortMatch = normalized.match(/youtu\.be\/([^?&#/]+)/i);
  if (shortMatch?.[1]) return shortMatch[1];

  return null;
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

function readImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    image.src = url;
  });
}

function canvasToFile(canvas: HTMLCanvasElement, source: File): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create cropped blob"));
          return;
        }
        const ext = source.name.includes(".") ? source.name.split(".").pop() : "jpg";
        const cropped = new File([blob], `cropped-${Date.now()}.${ext}`, { type: blob.type || source.type });
        resolve(cropped);
      },
      source.type || "image/jpeg",
      0.95
    );
  });
}

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [status, setStatus] = useState("Please log in.");

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>({
    slug: "",
    name: "",
    summary: "",
    stackText: "",
    repo: "",
    category: "project"
  });

  const [mediaFormGroup, setMediaFormGroup] = useState<MediaGroup | null>(null);
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);
  const [mediaDraft, setMediaDraft] = useState<MediaItem>({ src: "", label: "" });
  const [mediaUploadPreview, setMediaUploadPreview] = useState("");
  const [mediaUploadFile, setMediaUploadFile] = useState<File | null>(null);
  const [mediaUploadStatus, setMediaUploadStatus] = useState("");
  const [draggedPortraitIndex, setDraggedPortraitIndex] = useState<number | null>(null);

  const [showLiveSiteForm, setShowLiveSiteForm] = useState(false);
  const [editingLiveSiteIndex, setEditingLiveSiteIndex] = useState<number | null>(null);
  const [liveSiteDraft, setLiveSiteDraft] = useState<LiveSite>({
    name: "",
    url: "",
    description: ""
  });

  const [activeVideoGroup, setActiveVideoGroup] = useState<VideoGroup | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [videoDraft, setVideoDraft] = useState<VideoItem>({
    title: "",
    embedUrl: ""
  });
  const [sectionPages, setSectionPages] = useState<Record<ListKey, number>>(INITIAL_SECTION_PAGES);

  const listSizes = useMemo(
    () => ({
      portraits: content.portraits.length,
      printGallery: content.printGallery.length,
      featuredProjects: content.featuredProjects.length,
      liveSites: content.liveSites.length,
      tutorialVideos: content.tutorialVideos.length,
      projectVideos: content.projectVideos.length,
      printTimelapseVideos: content.printTimelapseVideos.length,
      facebookReels: content.facebookReels.length
    }),
    [
      content.portraits.length,
      content.printGallery.length,
      content.featuredProjects.length,
      content.liveSites.length,
      content.tutorialVideos.length,
      content.projectVideos.length,
      content.printTimelapseVideos.length,
      content.facebookReels.length
    ]
  );

  const paginateItems = <T,>(key: ListKey, items: T[]) => {
    const currentPage = sectionPages[key] || 1;
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const pageItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      pageItems,
      currentPage: safePage,
      totalPages,
      startIndex
    };
  };

  const changeSectionPage = (key: ListKey, delta: number) => {
    setSectionPages((prev) => {
      const maxPage = Math.max(1, Math.ceil((listSizes[key] || 0) / ITEMS_PER_PAGE));
      const next = Math.min(maxPage, Math.max(1, (prev[key] || 1) + delta));
      return { ...prev, [key]: next };
    });
  };

  const renderPagination = (key: ListKey, currentPage: number, totalPages: number) => {
    if (totalPages <= 1) return null;

    return (
      <div className="dashboard-pagination">
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => changeSectionPage(key, -1)}
          disabled={currentPage <= 1}
        >
          Previous
        </button>
        <p className="muted">Page {currentPage} of {totalPages}</p>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => changeSectionPage(key, 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const loadContent = () => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContent(normalizeContent(data));
        setStatus("Ready");
      })
      .catch(() => setStatus("Failed to load content"));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadContent();
  }, [isAuthenticated]);

  useEffect(() => {
    setSectionPages((prev) => ({
      portraits: Math.min(prev.portraits, Math.max(1, Math.ceil(listSizes.portraits / ITEMS_PER_PAGE))),
      printGallery: Math.min(prev.printGallery, Math.max(1, Math.ceil(listSizes.printGallery / ITEMS_PER_PAGE))),
      featuredProjects: Math.min(prev.featuredProjects, Math.max(1, Math.ceil(listSizes.featuredProjects / ITEMS_PER_PAGE))),
      liveSites: Math.min(prev.liveSites, Math.max(1, Math.ceil(listSizes.liveSites / ITEMS_PER_PAGE))),
      tutorialVideos: Math.min(prev.tutorialVideos, Math.max(1, Math.ceil(listSizes.tutorialVideos / ITEMS_PER_PAGE))),
      projectVideos: Math.min(prev.projectVideos, Math.max(1, Math.ceil(listSizes.projectVideos / ITEMS_PER_PAGE))),
      printTimelapseVideos: Math.min(
        prev.printTimelapseVideos,
        Math.max(1, Math.ceil(listSizes.printTimelapseVideos / ITEMS_PER_PAGE))
      ),
      facebookReels: Math.min(prev.facebookReels, Math.max(1, Math.ceil(listSizes.facebookReels / ITEMS_PER_PAGE)))
    }));
  }, [listSizes]);

  const updateField = (field: "name" | "alias" | "headline", value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const updateContact = (index: number, value: string) => {
    setContent((prev) => {
      const contacts = [...prev.contacts];
      contacts[index] = value;
      return { ...prev, contacts };
    });
  };

  const updateSocialLink = (field: "github" | "linkedin", value: string) => {
    setContent((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value
      }
    }));
  };

  const resetProjectDraft = () => {
    setProjectDraft({
      slug: "",
      name: "",
      summary: "",
      stackText: "",
      repo: "",
      category: "project"
    });
  };

  const startNewProject = () => {
    setEditingProjectIndex(null);
    resetProjectDraft();
    setShowProjectForm(true);
  };

  const startEditProject = (index: number) => {
    const project = content.featuredProjects[index];
    setEditingProjectIndex(index);
    setProjectDraft({
      slug: project.slug,
      name: project.name,
      summary: project.summary,
      stackText: project.stack.join(", "),
      repo: project.repo,
      category: project.category
    });
    setShowProjectForm(true);
  };

  const cancelProjectForm = () => {
    setShowProjectForm(false);
    setEditingProjectIndex(null);
    resetProjectDraft();
  };

  const saveProjectDraft = () => {
    const normalized: FeaturedProject = {
      slug: projectDraft.slug.trim(),
      name: projectDraft.name.trim(),
      summary: projectDraft.summary.trim(),
      stack: projectDraft.stackText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      repo: projectDraft.repo.trim(),
      category: projectDraft.category.trim() || "project"
    };

    if (!normalized.slug || !normalized.name || !normalized.summary || !normalized.repo) {
      setStatus("Project form needs slug, name, summary, and repo.");
      return;
    }

    setContent((prev) => {
      const next = [...prev.featuredProjects];
      if (editingProjectIndex === null) {
        next.push(normalized);
      } else {
        next[editingProjectIndex] = normalized;
      }
      return { ...prev, featuredProjects: next };
    });

    cancelProjectForm();
  };

  const removeProject = (index: number) => {
    setContent((prev) => ({
      ...prev,
      featuredProjects: prev.featuredProjects.filter((_, i) => i !== index)
    }));
  };

  const clearMediaUploadPreview = () => {
    if (mediaUploadPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaUploadPreview);
    }
    setMediaUploadPreview("");
    setMediaUploadFile(null);
  };

  const resetMediaEditor = () => {
    setMediaFormGroup(null);
    setEditingMediaIndex(null);
    setMediaDraft({ src: "", label: "" });
    setMediaUploadStatus("");
    clearMediaUploadPreview();
  };

  const startNewMedia = (group: MediaGroup) => {
    setMediaFormGroup(group);
    setEditingMediaIndex(null);
    setMediaDraft({ src: "", label: "" });
    setMediaUploadStatus("");
    clearMediaUploadPreview();
  };

  const startEditMedia = (group: MediaGroup, index: number) => {
    const selected = content[group][index];
    setMediaFormGroup(group);
    setEditingMediaIndex(index);
    setMediaDraft({ src: selected.src, label: selected.label });
    setMediaUploadStatus("");
    clearMediaUploadPreview();
  };

  const removeMedia = (group: MediaGroup, index: number) => {
    setContent((prev) => ({
      ...prev,
      [group]: prev[group].filter((_, i) => i !== index)
    }));
  };

  const onPortraitDragStart = (index: number) => {
    setDraggedPortraitIndex(index);
  };

  const onPortraitDrop = (targetIndex: number) => {
    if (draggedPortraitIndex === null || draggedPortraitIndex === targetIndex) {
      setDraggedPortraitIndex(null);
      return;
    }

    setContent((prev) => {
      const next = [...prev.portraits];
      const [moved] = next.splice(draggedPortraitIndex, 1);
      next.splice(targetIndex, 0, moved);
      return { ...prev, portraits: next };
    });
    setDraggedPortraitIndex(null);
  };

  const saveMediaDraft = () => {
    if (!mediaFormGroup) return;
    const normalized: MediaItem = {
      src: mediaDraft.src.trim(),
      label: mediaDraft.label.trim()
    };

    if (!normalized.src || !normalized.label) {
      setMediaUploadStatus("Image src and label are required.");
      return;
    }

    setContent((prev) => {
      const next = [...prev[mediaFormGroup]];
      if (editingMediaIndex === null) {
        next.push(normalized);
      } else {
        next[editingMediaIndex] = normalized;
      }
      return { ...prev, [mediaFormGroup]: next };
    });

    resetMediaEditor();
  };

  const onMediaFileChange = (file: File | null) => {
    clearMediaUploadPreview();
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setMediaUploadPreview(preview);
    setMediaUploadFile(file);
    setMediaUploadStatus("Preview ready. Crop (optional), then upload.");
  };

  const applySquareCrop = async () => {
    if (!mediaUploadFile) return;
    try {
      const image = await readImage(mediaUploadFile);
      const size = Math.min(image.width, image.height);
      const x = Math.floor((image.width - size) / 2);
      const y = Math.floor((image.height - size) / 2);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
      const cropped = await canvasToFile(canvas, mediaUploadFile);
      onMediaFileChange(cropped);
      setMediaUploadStatus("Square crop applied.");
    } catch {
      setMediaUploadStatus("Crop failed. Try another image.");
    }
  };

  const uploadMedia = async () => {
    if (!mediaUploadFile || !mediaFormGroup) return;
    setMediaUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", mediaUploadFile);
    formData.append("folder", mediaFormGroup === "portraits" ? "portraits" : "prints");

    const res = await fetch("/api/media-upload", {
      method: "POST",
      headers: {
        "x-admin-user": username,
        "x-admin-pass": password
      },
      body: formData
    });

    if (!res.ok) {
      setMediaUploadStatus("Upload failed.");
      return;
    }

    const payload = (await res.json()) as { src: string };
    setMediaDraft((prev) => ({
      ...prev,
      src: payload.src
    }));
    setMediaUploadStatus("Upload complete. Add label then save.");
  };

  const removeLiveSite = (index: number) => {
    setContent((prev) => ({
      ...prev,
      liveSites: prev.liveSites.filter((_, i) => i !== index)
    }));
  };

  const resetLiveSiteDraft = () => {
    setLiveSiteDraft({ name: "", url: "", description: "" });
  };

  const startNewLiveSite = () => {
    setEditingLiveSiteIndex(null);
    resetLiveSiteDraft();
    setShowLiveSiteForm(true);
  };

  const startEditLiveSite = (index: number) => {
    setEditingLiveSiteIndex(index);
    setLiveSiteDraft(content.liveSites[index]);
    setShowLiveSiteForm(true);
  };

  const cancelLiveSiteForm = () => {
    setShowLiveSiteForm(false);
    setEditingLiveSiteIndex(null);
    resetLiveSiteDraft();
  };

  const saveLiveSiteDraft = () => {
    const normalized: LiveSite = {
      name: liveSiteDraft.name.trim(),
      url: liveSiteDraft.url.trim(),
      description: liveSiteDraft.description.trim()
    };

    if (!normalized.name || !normalized.url) {
      setStatus("Live link needs name and URL.");
      return;
    }

    setContent((prev) => {
      const next = [...prev.liveSites];
      if (editingLiveSiteIndex === null) {
        next.push(normalized);
      } else {
        next[editingLiveSiteIndex] = normalized;
      }
      return { ...prev, liveSites: next };
    });

    cancelLiveSiteForm();
  };

  const videoGroupLabel = (group: VideoGroup) => {
    if (group === "tutorialVideos") return "Tutorial / Learning";
    if (group === "projectVideos") return "Project Videos";
    if (group === "facebookReels") return "Facebook Reel";
    return "3D Print Timelapse";
  };

  const resetVideoDraft = () => {
    setVideoDraft({ title: "", embedUrl: "" });
  };

  const startNewVideo = (group: VideoGroup) => {
    setActiveVideoGroup(group);
    setEditingVideoIndex(null);
    resetVideoDraft();
    setShowVideoForm(true);
  };

  const startEditVideo = (group: VideoGroup, index: number) => {
    setActiveVideoGroup(group);
    setEditingVideoIndex(index);
    setVideoDraft(content[group][index]);
    setShowVideoForm(true);
  };

  const cancelVideoForm = () => {
    setShowVideoForm(false);
    setEditingVideoIndex(null);
    setActiveVideoGroup(null);
    resetVideoDraft();
  };

  const saveVideoDraft = () => {
    if (!activeVideoGroup) return;
    const normalized: VideoItem = {
      title: videoDraft.title.trim(),
      embedUrl: videoDraft.embedUrl.trim()
    };

    if (!normalized.title) {
      setStatus("Video title is required.");
      return;
    }

    setContent((prev) => {
      const next = [...prev[activeVideoGroup]];
      if (editingVideoIndex === null) {
        next.push(normalized);
      } else {
        next[editingVideoIndex] = normalized;
      }
      return { ...prev, [activeVideoGroup]: next };
    });

    cancelVideoForm();
  };

  const removeVideo = (group: VideoGroup, index: number) => {
    setContent((prev) => ({
      ...prev,
      [group]: prev[group].filter((_, i) => i !== index)
    }));
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("Verifying...");

    const res = await fetch("/api/content/auth", {
      method: "POST",
      headers: {
        "x-admin-user": username,
        "x-admin-pass": password
      }
    });

    if (!res.ok) {
      setStatus("Login failed.");
      return;
    }

    setIsAuthenticated(true);
    setStatus("Loading...");
  };

  const portraitPage = paginateItems("portraits", content.portraits);
  const projectPage = paginateItems("featuredProjects", content.featuredProjects);
  const printPage = paginateItems("printGallery", content.printGallery);
  const liveSitePage = paginateItems("liveSites", content.liveSites);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("Saving...");

    const res = await fetch("/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-user": username,
        "x-admin-pass": password
      },
      body: JSON.stringify(content)
    });

    if (!res.ok) {
      setStatus("Save failed. Check admin key.");
      return;
    }

    setStatus("Saved. Refresh homepage to verify updates.");
  };

  const renderVideoPanel = (group: VideoGroup, heading: string, newLabel: string) => {
    const page = paginateItems(group, content[group]);
    const isFacebookGroup = group === "facebookReels";

    return (
      <section className="panel">
        <h2>{heading}</h2>
        <div className="dashboard-list">
          {content[group].length === 0 ? (
            <p className="muted">No videos yet.</p>
          ) : (
            page.pageItems.map((video, index) => {
              const globalIndex = page.startIndex + index;
              const thumb = isFacebookGroup ? null : getYouTubeThumbnail(video.embedUrl);

              return (
                <article key={`${video.title}-${globalIndex}`} className="dashboard-item dashboard-list-row compact-row">
                  <div className="row-thumb-wrap">
                    {thumb ? (
                      <img src={thumb} alt={video.title} className="row-thumb" />
                    ) : (
                      <div className="row-thumb row-thumb-fallback">VID</div>
                    )}
                  </div>
                  <div className="project-list-meta">
                    <p className="project-list-title">{video.title}</p>
                    <p className="muted">{video.embedUrl || "Embed URL pending"}</p>
                  </div>
                  <div className="project-list-actions">
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => startEditVideo(group, globalIndex)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => removeVideo(group, globalIndex)}>
                      Remove
                    </button>
                  </div>
                </article>
              );
            })
          )}
          {renderPagination(group, page.currentPage, page.totalPages)}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => startNewVideo(group)}>
          {newLabel}
        </button>

        {showVideoForm && activeVideoGroup === group ? (
          <article className="dashboard-item">
            <h3>{editingVideoIndex === null ? `Add ${videoGroupLabel(group)} Video` : `Edit ${videoGroupLabel(group)} Video`}</h3>
            <div className="dashboard-form">
              <label>
                Video Title
                <input
                  value={videoDraft.title}
                  onChange={(e) => setVideoDraft((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </label>
              <label>
                {isFacebookGroup ? "Reel URL or Facebook Embed Code" : "YouTube Embed URL"}
                <input
                  value={videoDraft.embedUrl}
                  onChange={(e) => setVideoDraft((prev) => ({ ...prev, embedUrl: e.target.value }))}
                  placeholder={isFacebookGroup ? "https://www.facebook.com/reel/... or <iframe ...>" : "https://www.youtube.com/embed/..."}
                />
              </label>
            </div>
            <div className="project-list-actions">
              <button type="button" className="btn btn-primary btn-small" onClick={saveVideoDraft}>
                Save Video
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={cancelVideoForm}>
                Cancel
              </button>
            </div>
          </article>
        ) : null}
      </section>
    );
  };

  return (
    <div className="page-shell">
      <section className="panel hero">
        <p className="eyebrow">Dashboard</p>
        <h1>Portfolio Content Manager</h1>
        <p className="muted">Manage projects, media, and links for the landing page.</p>
      </section>

      {!isAuthenticated ? (
        <section className="panel">
          <form className="dashboard-form" onSubmit={onLogin}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            <button className="btn btn-primary" type="submit">
              Login
            </button>
            <p className="muted">{status}</p>
          </form>
        </section>
      ) : (
        <form className="dashboard-stack" onSubmit={onSubmit}>
          <section className="panel">
            <h2>Header</h2>
            <div className="dashboard-form">
              <label>
                Name
                <input value={content.name} onChange={(e) => updateField("name", e.target.value)} required />
              </label>
              <label>
                Alias
                <input value={content.alias} onChange={(e) => updateField("alias", e.target.value)} required />
              </label>
              <label>
                Headline
                <input value={content.headline} onChange={(e) => updateField("headline", e.target.value)} required />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>About (Read-Only)</h2>
            <p className="readonly-note">About Me is managed outside the dashboard.</p>
            <div className="readonly-block">{content.about}</div>
          </section>

          <section className="panel">
            <h2>Profile Pictures</h2>
            <div className="dashboard-list">
              {content.portraits.length === 0 ? (
                <p className="muted">No profile pictures yet.</p>
              ) : (
                portraitPage.pageItems.map((item, index) => {
                  const globalIndex = portraitPage.startIndex + index;
                  return (
                    <article
                      key={item.src + globalIndex}
                      className="dashboard-item dashboard-list-row media-list-item draggable-item compact-row"
                      draggable
                      onDragStart={() => onPortraitDragStart(globalIndex)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => onPortraitDrop(globalIndex)}
                      onDragEnd={() => setDraggedPortraitIndex(null)}
                    >
                      <img src={item.src} alt={item.label} className="media-thumb row-thumb" />
                      <div className="project-list-meta">
                        <p className="project-list-title">{item.label}</p>
                        <p className="muted drag-hint">Drag to reorder</p>
                      </div>
                      <div className="project-list-actions">
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => startEditMedia("portraits", globalIndex)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => removeMedia("portraits", globalIndex)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
              {renderPagination("portraits", portraitPage.currentPage, portraitPage.totalPages)}
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => startNewMedia("portraits")}>
              New / Upload Profile Pic
            </button>

            {mediaFormGroup === "portraits" ? (
              <article className="dashboard-item">
                <h3>{editingMediaIndex === null ? "Add Profile Picture" : "Edit Profile Picture"}</h3>
                <div className="dashboard-form">
                  <label>
                    Image Label
                    <input
                      value={mediaDraft.label}
                      onChange={(e) => setMediaDraft((prev) => ({ ...prev, label: e.target.value }))}
                      placeholder="SelfieSuit"
                      required
                    />
                  </label>
                  <label>
                    Upload New File
                    <input type="file" accept="image/*" onChange={(e) => onMediaFileChange(e.target.files?.[0] || null)} />
                  </label>
                </div>
                {mediaUploadPreview ? <img src={mediaUploadPreview} alt="Upload preview" className="media-preview" /> : null}
                <div className="project-list-actions">
                  <button type="button" className="btn btn-ghost btn-small" onClick={applySquareCrop} disabled={!mediaUploadFile}>
                    Apply Square Crop
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={uploadMedia} disabled={!mediaUploadFile}>
                    Upload
                  </button>
                  <button type="button" className="btn btn-primary btn-small" onClick={saveMediaDraft}>
                    Save Picture
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={resetMediaEditor}>
                    Cancel
                  </button>
                </div>
                {mediaUploadStatus ? <p className="muted">{mediaUploadStatus}</p> : null}
              </article>
            ) : null}
          </section>

          <section className="panel">
            <h2>Contact + Social Links</h2>
            <div className="dashboard-form">
              <label>
                Contact Email 1
                <input value={content.contacts[0] || ""} onChange={(e) => updateContact(0, e.target.value)} required />
              </label>
              <label>
                Contact Email 2
                <input value={content.contacts[1] || ""} onChange={(e) => updateContact(1, e.target.value)} required />
              </label>
              <label>
                GitHub URL
                <input
                  value={content.socialLinks.github}
                  onChange={(e) => updateSocialLink("github", e.target.value)}
                  required
                />
              </label>
              <label>
                LinkedIn URL
                <input
                  value={content.socialLinks.linkedin}
                  onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                  required
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Featured Projects</h2>
            <div className="dashboard-list">
              {content.featuredProjects.length === 0 ? (
                <p className="muted">No projects added yet.</p>
              ) : (
                projectPage.pageItems.map((project, index) => {
                  const globalIndex = projectPage.startIndex + index;
                  return (
                    <article key={project.slug + globalIndex} className="dashboard-item dashboard-list-row compact-row">
                      <div className="row-thumb-wrap">
                        <div className="row-thumb row-thumb-fallback">PRJ</div>
                      </div>
                      <div className="project-list-meta">
                        <p className="project-list-title">{project.name}</p>
                        <p className="muted">
                          {project.category} · /projects/{project.slug}
                        </p>
                      </div>
                      <div className="project-list-actions">
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => startEditProject(globalIndex)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => removeProject(globalIndex)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
              {renderPagination("featuredProjects", projectPage.currentPage, projectPage.totalPages)}
            </div>

            <button type="button" className="btn btn-ghost" onClick={startNewProject}>
              New Project
            </button>

            {showProjectForm ? (
              <article className="dashboard-item">
                <h3>{editingProjectIndex === null ? "Add New Project" : "Edit Project"}</h3>
                <div className="dashboard-form">
                  <label>
                    Project Name
                    <input
                      value={projectDraft.name}
                      onChange={(e) => setProjectDraft((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Slug (used in /projects/slug)
                    <input
                      value={projectDraft.slug}
                      onChange={(e) => setProjectDraft((prev) => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Category
                    <input
                      value={projectDraft.category}
                      onChange={(e) => setProjectDraft((prev) => ({ ...prev, category: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Summary
                    <textarea
                      value={projectDraft.summary}
                      onChange={(e) => setProjectDraft((prev) => ({ ...prev, summary: e.target.value }))}
                      rows={3}
                      required
                    />
                  </label>
                  <label>
                    Stack (comma separated)
                    <input
                      value={projectDraft.stackText}
                      onChange={(e) => setProjectDraft((prev) => ({ ...prev, stackText: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Repository URL
                    <input
                      value={projectDraft.repo}
                      onChange={(e) => setProjectDraft((prev) => ({ ...prev, repo: e.target.value }))}
                      required
                    />
                  </label>
                </div>
                <div className="project-list-actions">
                  <button type="button" className="btn btn-primary btn-small" onClick={saveProjectDraft}>
                    Save Project
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={cancelProjectForm}>
                    Cancel
                  </button>
                </div>
              </article>
            ) : null}
          </section>

          {renderVideoPanel("tutorialVideos", "TutorSpark + Learning Videos", "New Learning Video")}

          {renderVideoPanel("projectVideos", "Project Videos", "New Project Video")}

          {renderVideoPanel("printTimelapseVideos", "3D Print Timelapse Videos", "New Timelapse Video")}

          {renderVideoPanel("facebookReels", "Facebook Reels (3D Printing)", "New Facebook Reel")}

          <section className="panel">
            <h2>3D Print Media</h2>
            <div className="dashboard-list">
              {content.printGallery.length === 0 ? (
                <p className="muted">No print media yet.</p>
              ) : (
                printPage.pageItems.map((item, index) => {
                  const globalIndex = printPage.startIndex + index;
                  return (
                    <article key={item.src + globalIndex} className="dashboard-item dashboard-list-row media-list-item compact-row">
                      <img src={item.src} alt={item.label} className="media-thumb media-thumb-print row-thumb" />
                      <div className="project-list-meta">
                        <p className="project-list-title">{item.label}</p>
                      </div>
                      <div className="project-list-actions">
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => startEditMedia("printGallery", globalIndex)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => removeMedia("printGallery", globalIndex)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
              {renderPagination("printGallery", printPage.currentPage, printPage.totalPages)}
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => startNewMedia("printGallery")}>
              New / Upload Print Media
            </button>

            {mediaFormGroup === "printGallery" ? (
              <article className="dashboard-item">
                <h3>{editingMediaIndex === null ? "Add 3D Print Media" : "Edit 3D Print Media"}</h3>
                <div className="dashboard-form">
                  <label>
                    Image Label
                    <input
                      value={mediaDraft.label}
                      onChange={(e) => setMediaDraft((prev) => ({ ...prev, label: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Upload New File
                    <input type="file" accept="image/*" onChange={(e) => onMediaFileChange(e.target.files?.[0] || null)} />
                  </label>
                </div>
                {mediaUploadPreview ? <img src={mediaUploadPreview} alt="Upload preview" className="media-preview" /> : null}
                <div className="project-list-actions">
                  <button type="button" className="btn btn-ghost btn-small" onClick={uploadMedia} disabled={!mediaUploadFile}>
                    Upload
                  </button>
                  <button type="button" className="btn btn-primary btn-small" onClick={saveMediaDraft}>
                    Save Media
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={resetMediaEditor}>
                    Cancel
                  </button>
                </div>
                {mediaUploadStatus ? <p className="muted">{mediaUploadStatus}</p> : null}
              </article>
            ) : null}
          </section>

          <section className="panel">
            <h2>Live Site Links</h2>
            <div className="dashboard-list">
              {content.liveSites.length === 0 ? (
                <p className="muted">No live links yet.</p>
              ) : (
                liveSitePage.pageItems.map((site, index) => {
                  const globalIndex = liveSitePage.startIndex + index;
                  return (
                    <article key={site.url + globalIndex} className="dashboard-item dashboard-list-row compact-row">
                      <div className="row-thumb-wrap">
                        <img src={getLiveSitePreview(site)} alt={site.name} className="row-thumb" />
                      </div>
                      <div className="project-list-meta">
                        <p className="project-list-title">{site.name}</p>
                        <p className="muted">{site.description || site.url}</p>
                      </div>
                      <div className="project-list-actions">
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => startEditLiveSite(globalIndex)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => removeLiveSite(globalIndex)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
              {renderPagination("liveSites", liveSitePage.currentPage, liveSitePage.totalPages)}
            </div>

            <button type="button" className="btn btn-ghost" onClick={startNewLiveSite}>
              New Live Link
            </button>

            {showLiveSiteForm ? (
              <article className="dashboard-item">
                <h3>{editingLiveSiteIndex === null ? "Add Live Link" : "Edit Live Link"}</h3>
                <div className="dashboard-form">
                  <label>
                    Site Name
                    <input
                      value={liveSiteDraft.name}
                      onChange={(e) => setLiveSiteDraft((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    URL
                    <input
                      value={liveSiteDraft.url}
                      onChange={(e) => setLiveSiteDraft((prev) => ({ ...prev, url: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <input
                      value={liveSiteDraft.description}
                      onChange={(e) => setLiveSiteDraft((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </label>
                </div>
                <div className="project-list-actions">
                  <button type="button" className="btn btn-primary btn-small" onClick={saveLiveSiteDraft}>
                    Save Link
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={cancelLiveSiteForm}>
                    Cancel
                  </button>
                </div>
              </article>
            ) : null}
          </section>

          <section className="panel">
            <button className="btn btn-primary" type="submit">
              Save Changes
            </button>
            <p className="muted">{status}</p>
          </section>
        </form>
      )}
    </div>
  );
}
