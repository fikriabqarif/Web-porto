import Link from "next/link";
import { adminHref } from "@/lib/admin-path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [projectCount, publishedProjects, postCount, publishedPosts, unreadMessages, totalMessages] =
    await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { published: true } }),
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.message.count({ where: { read: false } }),
      prisma.message.count(),
    ]);

  const stats = [
    {
      href: adminHref("/projects"),
      label: "Projects",
      value: projectCount,
      detail: `${publishedProjects} published · ${projectCount - publishedProjects} draft`,
    },
    {
      href: adminHref("/posts"),
      label: "Notes",
      value: postCount,
      detail: `${publishedPosts} published · ${postCount - publishedPosts} draft`,
    },
    {
      href: adminHref("/messages"),
      label: "Unread messages",
      value: unreadMessages,
      detail: `${totalMessages} total`,
    },
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="label">Dashboard</p>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      </header>

      <ul className="grid gap-px sm:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.href}>
            <Link
              href={stat.href}
              className="block space-y-2 border border-border p-6 transition-colors duration-150 hover:border-foreground"
            >
              <p className="label">{stat.label}</p>
              <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted">{stat.detail}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link href={adminHref("/projects/new")} className="btn-primary">
          New project
        </Link>
        <Link href={adminHref("/posts/new")} className="btn-secondary">
          New note
        </Link>
        <Link href={adminHref("/settings")} className="btn-secondary">
          Settings
        </Link>
      </div>
    </div>
  );
}
