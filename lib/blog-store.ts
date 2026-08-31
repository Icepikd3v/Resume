import { blogPosts as seedPosts, type BlogPost } from "@/lib/blog-data";
import { getMongoDb } from "@/lib/mongo-client";

const COLLECTION = "blog_posts";

export type BlogStoreStatus = {
  persistent: boolean;
  reason?: string;
};

/**
 * Posts are stored in MongoDB rather than on disk. The dashboard runs on
 * Vercel, where the filesystem is read-only at runtime and reset on every
 * deploy, so the JSON-file approach used by the site-content store cannot
 * hold anything a user types into the blog form.
 *
 * The entries in blog-data.ts act as the seed. On first read against an empty
 * collection they are inserted, after which the collection is the source of
 * truth and those posts become editable like any other.
 */

function toStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function normalizeSections(input: unknown): BlogPost["sections"] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry) => {
      const row = entry as Partial<BlogPost["sections"][number]>;
      return {
        title: String(row?.title ?? "").trim(),
        body: toStringArray(row?.body)
      };
    })
    .filter((section) => section.title && section.body.length);
}

function normalizeVisuals(input: unknown): BlogPost["visuals"] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry) => {
      const row = entry as Partial<BlogPost["visuals"][number]>;
      return {
        src: String(row?.src ?? "").trim(),
        alt: String(row?.alt ?? "").trim(),
        caption: String(row?.caption ?? "").trim()
      };
    })
    .filter((visual) => visual.src);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Returns null when the payload cannot make a renderable post. The blog page
 * maps over sections, visuals and all three retrospective lists without
 * guarding, so a half-formed record would break the page for every reader.
 */
export function normalizeBlogPost(input: unknown): BlogPost | null {
  const row = input as Partial<BlogPost> | null;
  if (!row) return null;

  const title = String(row.title ?? "").trim();
  if (!title) return null;

  const slug = slugify(String(row.slug ?? "").trim() || title);
  if (!slug) return null;

  const retrospective = row.retrospective as Partial<BlogPost["retrospective"]> | undefined;
  const projectSlug = String(row.projectSlug ?? "").trim();

  return {
    slug,
    title,
    subtitle: String(row.subtitle ?? "").trim(),
    author: String(row.author ?? "").trim() || "Samuel Farmer",
    date: String(row.date ?? "").trim(),
    ...(projectSlug ? { projectSlug } : {}),
    tags: toStringArray(row.tags),
    intro: String(row.intro ?? "").trim(),
    sections: normalizeSections(row.sections),
    visuals: normalizeVisuals(row.visuals),
    retrospective: {
      wentRight: toStringArray(retrospective?.wentRight),
      wentWrong: toStringArray(retrospective?.wentWrong),
      improvements: toStringArray(retrospective?.improvements)
    }
  };
}

/**
 * Newest first. Dates are free text ("August 30, 2026"), so anything
 * unparseable sorts last rather than throwing off the whole order.
 */
function sortKeyFor(post: BlogPost): number {
  const parsed = Date.parse(post.date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => sortKeyFor(b) - sortKeyFor(a));
}

async function getCollection() {
  const db = await getMongoDb();
  return db.collection(COLLECTION);
}

export async function getBlogStoreStatus(): Promise<BlogStoreStatus> {
  try {
    await getCollection();
    return { persistent: true };
  } catch (error) {
    return {
      persistent: false,
      reason: error instanceof Error ? error.message : "Blog storage unavailable."
    };
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const collection = await getCollection();
    const stored = await collection.find({}, { projection: { _id: 0 } }).toArray();

    if (!stored.length) {
      const seeded = seedPosts
        .map((post) => normalizeBlogPost(post))
        .filter((post): post is BlogPost => post !== null);

      if (seeded.length) {
        await collection.insertMany(seeded.map((post) => ({ ...post })));
      }
      return sortPosts(seeded);
    }

    const posts = stored
      .map((row) => normalizeBlogPost(row))
      .filter((post): post is BlogPost => post !== null);

    return sortPosts(posts);
  } catch {
    // Without a reachable database the published entries still render; only
    // dashboard editing is lost, and the dashboard reports that separately.
    return sortPosts(seedPosts);
  }
}

export async function findBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function saveBlogPost(input: unknown): Promise<BlogPost> {
  const post = normalizeBlogPost(input);
  if (!post) {
    throw new Error("A post needs at least a title.");
  }

  const collection = await getCollection();
  await collection.updateOne({ slug: post.slug }, { $set: { ...post } }, { upsert: true });
  return post;
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  const normalized = slugify(slug);
  if (!normalized) return false;

  const collection = await getCollection();
  const result = await collection.deleteOne({ slug: normalized });
  return result.deletedCount > 0;
}
