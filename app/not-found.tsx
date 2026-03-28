import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <section className="panel">
        <h1>Not Found</h1>
        <p className="muted">The page you requested does not exist.</p>
        <Link href="/" className="inline-link">
          Return home
        </Link>
      </section>
    </div>
  );
}
