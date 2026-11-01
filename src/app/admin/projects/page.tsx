import Link from "next/link";
import { deleteProject, toggleProjectFeatured, toggleProjectPublished } from "@/actions/projects";
import { ConfirmButton } from "@/components/confirm-button";
import { adminHref } from "@/lib/admin-path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="label">Content</p>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        </div>
        <Link href={adminHref("/projects/new")} className="btn-primary">
          New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <p className="text-sm text-muted">No projects yet.</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="label p-3">Title</th>
                <th scope="col" className="label p-3">Status</th>
                <th scope="col" className="label p-3">Featured</th>
                <th scope="col" className="label p-3">Updated</th>
                <th scope="col" className="label p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border last:border-b-0">
                  <td className="p-3 align-top">
                    <Link href={adminHref(`/projects/${project.id}/edit`)} className="link-underline font-medium">
                      {project.title}
                    </Link>
                    <p className="text-xs text-muted">/{project.slug}</p>
                  </td>
                  <td className="p-3 align-top">
                    <span className="label">{project.published ? "Published" : "Draft"}</span>
                  </td>
                  <td className="p-3 align-top">
                    <span className="label">{project.featured ? "Yes" : "—"}</span>
                  </td>
                  <td className="p-3 align-top text-xs text-muted">
                    {project.updatedAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link href={adminHref(`/projects/${project.id}/edit`)} className="btn-quiet">
                        Edit
                      </Link>
                      <form action={toggleProjectPublished}>
                        <input type="hidden" name="id" value={project.id} />
                        <button type="submit" className="btn-quiet">
                          {project.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={toggleProjectFeatured}>
                        <input type="hidden" name="id" value={project.id} />
                        <button type="submit" className="btn-quiet">
                          {project.featured ? "Unfeature" : "Feature"}
                        </button>
                      </form>
                      <form action={deleteProject}>
                        <input type="hidden" name="id" value={project.id} />
                        <ConfirmButton message={`Delete "${project.title}"? This cannot be undone.`}>Delete</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
