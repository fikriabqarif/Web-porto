import Link from "next/link";
import Image from "next/image";
import { TagList } from "@/components/tag-list";

type ProjectCardProps = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  image?: { url: string; alt: string } | undefined;
};

export function ProjectCard({ slug, title, summary, tags, image }: ProjectCardProps) {
  return (
    <article className="group border border-border transition-colors duration-150 hover:border-foreground">
      <Link href={`/projects/${slug}`} className="block focus-visible:outline-none">
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted/10">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="label">No image</span>
            </div>
          )}
        </div>

        <div className="space-y-3 p-6">
          <h3 className="text-lg font-bold tracking-tight text-foreground underline-offset-4 group-hover:underline">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted">{summary}</p>
          <TagList tags={tags} />
        </div>
      </Link>
    </article>
  );
}
