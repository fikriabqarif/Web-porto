import Link from "next/link";
import { PostForm } from "@/components/admin/post-form";
import { adminHref } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href={adminHref("/posts")} className="label link-underline">
          ← Notes
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New note</h1>
      </header>

      <PostForm
        initial={{
          id: "",
          title: "",
          slug: "",
          excerpt: "",
          body: "",
          tags: "",
          published: false,
        }}
      />
    </div>
  );
}
