import type { ExperienceItem } from "@/content/profile";

export function ExperienceList({ items }: { items: ExperienceItem[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <li key={`${item.org}-${item.role}`} className="grid gap-4 py-8 sm:grid-cols-[8.5rem_1fr]">
          <p className="label pt-1">{item.period}</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-bold tracking-tight text-foreground">{item.role}</h3>
              <p className="text-sm text-muted">
                {item.org}
                <span className="text-border"> · </span>
                {item.place}
              </p>
            </div>
            <ul className="space-y-2">
              {item.bullets.map((bullet) => (
                <li key={bullet.slice(0, 40)} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.65em] h-px w-3 shrink-0 bg-muted" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}
