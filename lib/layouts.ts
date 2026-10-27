import { nanoid } from "nanoid";
import { useDoc } from "./store/doc";
import { useUi } from "./store/ui";
import type { SlotEl } from "./types";

/** Normalized cells [x, y, w, h] in 0–1 page space. */
type Cell = [number, number, number, number];

const grid = (cols: number, rows: number): Cell[] =>
  Array.from({ length: cols * rows }, (_, i) => [(i % cols) / cols, Math.floor(i / cols) / rows, 1 / cols, 1 / rows]);

/** "Create" layouts in Templates; names live in the dictionary (templatesPanel.layoutNames). */
export const LAYOUTS: { id: string; cells: Cell[] }[] = [
  { id: "single", cells: grid(1, 1) },
  { id: "splitV", cells: grid(2, 1) },
  { id: "splitH", cells: grid(1, 2) },
  { id: "twoTopOne", cells: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 1, 0.5]] },
  { id: "oneTwoBottom", cells: [[0, 0, 1, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]] },
  { id: "grid2x2", cells: grid(2, 2) },
  { id: "strip3", cells: grid(1, 3) },
  { id: "cols3", cells: grid(3, 1) },
  { id: "grid2x3", cells: grid(2, 3) },
  { id: "grid3x3", cells: grid(3, 3) },
];

function activePageBox() {
  const { doc } = useDoc.getState();
  const page = Math.min(useUi.getState().activePage, doc.format.pages - 1);
  return { page, ...doc.format };
}

function slot(x: number, y: number, width: number, height: number): SlotEl {
  return { id: nanoid(10), type: "slot", x, y, width, height, rotation: 0, opacity: 1 };
}

/** Stamps a layout's empty frames onto the active page (one undo step). */
export function stampLayout(cells: Cell[]) {
  const { page, w, h } = activePageBox();
  const margin = w * 0.03;
  const gap = w * 0.015;
  const innerW = w - margin * 2;
  const innerH = h - margin * 2;
  const slots = cells.map(([nx, ny, nw, nh]) => {
    // Interior edges get half a gap each, so neighbours end up exactly one gap apart.
    const left = nx > 0 ? gap / 2 : 0;
    const right = nx + nw < 0.999 ? gap / 2 : 0;
    const top = ny > 0 ? gap / 2 : 0;
    const bottom = ny + nh < 0.999 ? gap / 2 : 0;
    return slot(
      page * w + margin + nx * innerW + left,
      margin + ny * innerH + top,
      nw * innerW - left - right,
      nh * innerH - top - bottom,
    );
  });
  useDoc.getState().addElements(slots);
  useUi.getState().setSelection(slots.map((s) => s.id));
}

/** One empty frame in the middle of the active page. */
export function insertEmptyFrame() {
  const { page, w, h } = activePageBox();
  const width = w * 0.5;
  const height = width * 1.25;
  const el = slot(page * w + (w - width) / 2, (h - height) / 2, width, height);
  useDoc.getState().addElements([el]);
  useUi.getState().setSelection([el.id]);
}
