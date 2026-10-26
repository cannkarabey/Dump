import type { Frame } from "@/lib/types";

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Space between the outer element box and the photo, per frame style. */
export function frameInsets(frame: Frame | undefined, w: number, h: number): Insets {
  const s = Math.min(w, h);
  switch (frame) {
    case "polaroid": {
      const side = s * 0.055;
      return { top: side, right: side, left: side, bottom: Math.min(s * 0.2, h * 0.3) };
    }
    case "film": {
      // Sprocket holes run along the longer edge.
      return w >= h
        ? { top: h * 0.14, bottom: h * 0.14, left: w * 0.03, right: w * 0.03 }
        : { top: h * 0.03, bottom: h * 0.03, left: w * 0.14, right: w * 0.14 };
    }
    default:
      return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}

/** Sprocket hole rects for the film frame, in element-local coordinates. */
export function filmHoles(w: number, h: number) {
  const horizontal = w >= h;
  const length = horizontal ? w : h;
  const band = (horizontal ? h : w) * 0.14;
  const holeLong = band * 0.55;
  const holeShort = band * 0.4;
  const step = holeLong * 1.9;
  const count = Math.max(1, Math.floor(length / step));
  const offset = (length - count * step) / 2 + (step - holeLong) / 2;
  const holes: { x: number; y: number; width: number; height: number }[] = [];
  for (let i = 0; i < count; i++) {
    const along = offset + i * step;
    for (const side of [0, 1]) {
      const across = side === 0 ? (band - holeShort) / 2 : (horizontal ? h : w) - band + (band - holeShort) / 2;
      holes.push(
        horizontal
          ? { x: along, y: across, width: holeLong, height: holeShort }
          : { x: across, y: along, width: holeShort, height: holeLong },
      );
    }
  }
  return holes;
}
