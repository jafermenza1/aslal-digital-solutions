export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-3 text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">{eyebrow}</div>
      <h2 className="text-3xl font-black tracking-[-.04em] text-[#1E293B] sm:text-5xl">{title}</h2>
      {description && <p className="mt-5 text-base leading-7 text-[#1E293B]/65 sm:text-lg">{description}</p>}
    </div>
  );
}
