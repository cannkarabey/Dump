import { TEMPLATES } from "@/lib/templates";
import { EFFECTS } from "@/lib/motion";
import { TemplatePreview } from "@/components/editor/TemplatePreview";

/**
 * Endless strip of template previews (our own content, no third-party logos). The list is
 * rendered twice for a seamless loop; the copy is aria-hidden. Pauses on hover/focus.
 */
export function Marquee({ label }: { label: string }) {
  if (!EFFECTS.marquee) return null;
  const items = TEMPLATES.slice(0, 10);
  const row = (hidden: boolean) =>
    items.map((t) => {
      const pages = t.mode === "single" ? 1 : t.pages;
      return (
        <li key={`${hidden ? "b" : "a"}-${t.id}`} aria-hidden={hidden || undefined} className="shrink-0 px-2">
          <figure className="overflow-hidden rounded-2xl bg-white p-2 shadow-card">
            <div className="h-36 overflow-hidden rounded-xl sm:h-44" style={{ aspectRatio: `${3 * Math.min(pages, 3)} / 4` }}>
              <div className="h-full" style={{ width: `${(pages / Math.min(pages, 3)) * 100}%` }}>
                <TemplatePreview t={t} colorful />
              </div>
            </div>
            <figcaption className="px-1 pt-2 text-xs font-medium text-muted">{t.title}</figcaption>
          </figure>
        </li>
      );
    });

  return (
    <section aria-label={label} className="marquee overflow-hidden py-6">
      <ul className="marquee-track">
        {row(false)}
        {row(true)}
      </ul>
    </section>
  );
}
