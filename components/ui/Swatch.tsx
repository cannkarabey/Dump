import { cn } from "@/lib/cn";

export function Swatch({
  color,
  selected,
  onClick,
  label,
}: {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const transparent = color === "transparent";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? color}
      aria-pressed={selected}
      className={cn(
        "size-8 rounded-full border border-border-strong transition",
        selected && "ring-2 ring-fg ring-offset-2 ring-offset-panel",
      )}
      style={
        transparent
          ? {
              backgroundImage:
                "repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%)",
              backgroundSize: "10px 10px",
            }
          : { background: color }
      }
    />
  );
}
