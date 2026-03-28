import Link from "next/link";

export async function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/">Home</Link>
        <a href="/#about">About</a>
        <a href="/#projects">Projects</a>
        <Link href="/video">Video</Link>
        <Link href="/s3d-print-processing">S3D Print&Processing</Link>
        <Link href="/dashboard">AdminDash</Link>
      </nav>
    </header>
  );
}
