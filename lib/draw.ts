import { nanoid } from "nanoid";
import { useDoc } from "./store/doc";
import { useUi } from "./store/ui";
import type { BrushTool, DrawEl, ShapeEl, ShapeKind } from "./types";

/** Brush sizes in the panel are in px at 1080px page width; this converts to doc px. */
export function brushScale(): number {
  return useDoc.getState().doc.format.w / 1080;
}

/** Turns absolute stage points into a stroke element (points relative to its bounding box). */
export function commitStroke(abs: number[], tool: BrushTool, color: string, size: number, opacity: number) {
  if (abs.length < 4) {
    // A click without movement still leaves a dot.
    abs = [abs[0], abs[1], abs[0] + 0.01, abs[1] + 0.01];
  }
  const xs = abs.filter((_, i) => i % 2 === 0);
  const ys = abs.filter((_, i) => i % 2 === 1);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const el: DrawEl = {
    id: nanoid(10),
    type: "draw",
    tool,
    stroke: color,
    strokeWidth: size * brushScale(),
    points: abs.map((v, i) => (i % 2 === 0 ? v - minX : v - minY)),
    x: minX,
    y: minY,
    width: Math.max(1, Math.max(...xs) - minX),
    height: Math.max(1, Math.max(...ys) - minY),
    rotation: 0,
    opacity,
  };
  useDoc.getState().addElements([el]);
}

export function clearDrawings() {
  const ids = useDoc
    .getState()
    .doc.elements.filter((el) => el.type === "draw")
    .map((el) => el.id);
  if (ids.length) useDoc.getState().removeElements(ids);
}

export function addShape(kind: ShapeKind) {
  const { doc } = useDoc.getState();
  const { w, h, pages } = doc.format;
  const page = Math.min(useUi.getState().activePage, pages - 1);
  const { color, size, outline, opacity } = useUi.getState().brush;
  const width = w * 0.35;
  const linear = kind === "line" || kind === "arrow";
  const height = linear ? Math.max(size * brushScale() * 4, w * 0.04) : kind === "heart" ? width * 0.92 : width;
  const el: ShapeEl = {
    id: nanoid(10),
    type: "shape",
    kind,
    fill: color,
    outline: linear ? undefined : outline || undefined,
    strokeWidth: size * brushScale(),
    x: page * w + (w - width) / 2,
    y: (h - height) / 2,
    width,
    height,
    rotation: 0,
    opacity,
  };
  useDoc.getState().addElements([el]);
  useUi.getState().setSelection([el.id]);
}
