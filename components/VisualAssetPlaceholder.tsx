export function VisualAssetPlaceholder({
  label = "VISUAL ASSET PLACEHOLDER",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`aslal-visual-placeholder is-loading ${className}`} aria-label={label}>
      <div className="relative z-10 text-center">
        <div className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">ASLAL VISUAL SYSTEM</div>
        <div className="mt-2 text-xs font-bold text-white/60">{label}</div>
        <div className="mt-1 text-[10px] text-white/35">16:9 asset slot · CLS-safe</div>
      </div>
    </div>
  );
}
