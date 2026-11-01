import Link from "next/link";
import { ProjectForm } from "@/components/admin/project-form";
import { adminHref } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href={adminHref("/projects")} className="label link-underline">
          ← Projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New project</h1>
      </header>

      <ProjectForm
        initial={{
          id: "",
          title: "",
          slug: "",
          summary: "",
          description: "",
          role: "",
          tags: "",
          githubUrl: "",
          demoUrl: "",
          featured: false,
          published: false,
          images: [],
        }}
      />
    </div>
  );
}
