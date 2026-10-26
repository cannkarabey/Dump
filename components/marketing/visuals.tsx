import { cn } from "@/lib/cn";

/** Placeholder "photos" for marketing demos until real sample shots are licensed (Unsplash/Pexels, S2.6). */
export const GRADIENTS = [
  "from-[#ffb199] to-[#ff5f6d]",
  "from-[#a1c4fd] to-[#5b8cff]",
  "from-[#c2f0c2] to-[#3fb68b]",
  "from-[#ffd29d] to-[#ff9a3c]",
  "from-[#e0c3fc] to-[#8e6cff]",
  "from-[#fbc2eb] to-[#ff5fa2]",
  "from-[#2b2f4a] to-[#6a7bb5]",
  "from-[#fdfcfb] to-[#e2d1c3]",
];

export function PhotoTile({
  i,
  className,
  children,
  style,
}: {
  i: number;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn("relative overflow-hidden bg-gradient-to-br", GRADIENTS[i % GRADIENTS.length], className)}
    >
      {/* Soft "subject" blob so tiles read as photos rather than swatches. */}
      <div className="absolute top-1/2 left-1/2 size-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35 blur-md" />
      {children}
    </div>
  );
}

export function DateStamp({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn("absolute right-2 bottom-1.5 font-stamp text-[#ffa41f] [text-shadow:0_0_6px_#ff6a00]", className)}
    >
      {children}
    </span>
  );
}

export function Polaroid({ i, rotate = 0, className, stamp }: { i: number; rotate?: number; className?: string; stamp?: string }) {
  return (
    <div
      className={cn("bg-[#fdfcf8] p-[5%] pb-[18%] shadow-[0_12px_30px_-10px_#0000004d]", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <PhotoTile i={i} className="aspect-square w-full">
        {stamp && <DateStamp className="text-[10px]">{stamp}</DateStamp>}
      </PhotoTile>
    </div>
  );
}
