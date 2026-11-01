import Link from "next/link";
import { deletePost, togglePostPublished } from "@/actions/posts";
import { ConfirmButton } from "@/components/confirm-button";
import { adminHref } from "@/lib/admin-path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="label">Content</p>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
        </div>
        <Link href={adminHref("/posts/new")} className="btn-primary">
          New note
        </Link>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-muted">No notes yet.</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="label p-3">Title</th>
                <th scope="col" className="label p-3">Status</th>
                <th scope="col" className="label p-3">Published</th>
                <th scope="col" className="label p-3">Updated</th>
                <th scope="col" className="label p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-b-0">
                  <td className="p-3 align-top">
                    <Link href={adminHref(`/posts/${post.id}/edit`)} className="link-underline font-medium">
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted">/{post.slug}</p>
                  </td>
                  <td className="p-3 align-top">
                    <span className="label">{post.published ? "Published" : "Draft"}</span>
                  </td>
                  <td className="p-3 align-top text-xs text-muted">
                    {post.publishedAt ? post.publishedAt.toISOString().slice(0, 10) : "—"}
                  </td>
                  <td className="p-3 align-top text-xs text-muted">
                    {post.updatedAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link href={adminHref(`/posts/${post.id}/edit`)} className="btn-quiet">
                        Edit
                      </Link>
                      <form action={togglePostPublished}>
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className="btn-quiet">
                          {post.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={post.id} />
                        <ConfirmButton message={`Delete "${post.title}"? This cannot be undone.`}>Delete</ConfirmButton>
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
