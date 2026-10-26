import type { Template } from "@/lib/templates/schema";

const W = 30;
const H = 40;

/** Lightweight SVG thumbnail drawn from the template's own geometry (no preview images needed). */
export function TemplatePreview({ t }: { t: Template }) {
  const pages = t.mode === "single" ? 1 : t.pages;
  const dark = isDark(t.background);
  const slotFill = dark ? "#ffffff38" : "#7c5cff33";
  const ink = dark ? "#ffffffcc" : "#1d1d1fcc";

  return (
    <svg viewBox={`0 0 ${W * pages} ${H}`} className="block h-full w-full" aria-hidden>
      <rect width={W * pages} height={H} fill={t.background} />
      {t.elements
        .filter((e) => e.page < pages)
        .map((e, i) => {
          const x = (e.page + e.nx) * W;
          const y = e.ny * H;
          const w = e.nw * W;
          const h = e.nh * H;
          const transform = e.rotation ? `rotate(${e.rotation} ${x + w / 2} ${y + h / 2})` : undefined;
          if (e.type === "text") {
            return <rect key={i} x={x} y={y + h * 0.3} width={w * 0.7} height={Math.max(1, h * 0.4)} rx={0.5} fill={ink} transform={transform} />;
          }
          if (e.type === "shape") {
            return <rect key={i} x={x} y={y} width={w} height={h} fill={e.fill} transform={transform} />;
          }
          return (
            <g key={i} transform={transform}>
              {e.frame === "polaroid" && <rect x={x} y={y} width={w} height={h} fill="#fdfcf8" />}
              {e.frame === "film" && <rect x={x} y={y} width={w} height={h} fill="#0d0d0d" />}
              <rect
                x={x + (e.frame === "polaroid" ? w * 0.06 : e.frame === "film" ? w * 0.04 : 0)}
                y={y + (e.frame === "polaroid" ? w * 0.06 : e.frame === "film" ? h * 0.14 : 0)}
                width={w * (e.frame === "polaroid" ? 0.88 : e.frame === "film" ? 0.92 : 1)}
                height={h * (e.frame === "polaroid" ? 0.72 : e.frame === "film" ? 0.72 : 1)}
                rx={e.frame ? 0 : 0.8}
                fill={slotFill}
              />
            </g>
          );
        })}
      {Array.from({ length: pages - 1 }, (_, i) => (
        <line key={i} x1={(i + 1) * W} x2={(i + 1) * W} y1={0} y2={H} stroke="#7c5cff" strokeWidth={0.3} strokeDasharray="1 1" />
      ))}
    </svg>
  );
}

function isDark(hex: string) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  if (Number.isNaN(n)) return false;
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}
