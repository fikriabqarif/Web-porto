import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-24">
      <p className="label">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-sm text-muted">
        That page does not exist, or it is still a draft.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          Home
        </Link>
        <Link href="/projects" className="btn-secondary">
          Projects
        </Link>
      </div>
    </div>
  );
}
