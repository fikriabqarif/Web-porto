export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag} className="border border-border px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-muted">
          {tag}
        </li>
      ))}
    </ul>
  );
}
