/** Shared layout for legal pages; content is plain sections so lawyers can edit text easily. */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: React.ReactNode }[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">Son güncelleme: {updated}</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold tracking-[-0.01em]">{s.heading}</h2>
            <div className="mt-2 flex flex-col gap-3 text-[15px] leading-relaxed text-fg/75 [&_li]:ml-5 [&_li]:list-disc">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

/** Values to fill in before launch (company details aren't known yet). */
export const LEGAL = {
  company: "[Şirket unvanı]",
  address: "[Adres]",
  email: "[iletisim@alanadi.com]",
  updated: "27 Ekim 2026",
};
