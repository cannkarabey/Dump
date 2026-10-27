"use client";

import { Group, Line } from "react-konva";
import { useUi, type GridKind } from "@/lib/store/ui";

const PHI = 0.382;

/** Guide positions as fractions of the page: [vertical lines, horizontal lines]. */
export const GRID_LINES: Record<GridKind, [number[], number[]]> = {
  none: [[], []],
  thirds: [[1 / 3, 2 / 3], [1 / 3, 2 / 3]],
  center: [[0.5], [0.5]],
  golden: [[PHI, 1 - PHI], [PHI, 1 - PHI]],
  cols2: [[0.5], []],
  rows2: [[], [0.5]],
  grid2x2: [[0.5], [0.5]],
  grid3x2: [[1 / 3, 2 / 3], [0.5]],
  grid3x3: [[1 / 3, 2 / 3], [1 / 3, 2 / 3]],
  grid4x4: [[0.25, 0.5, 0.75], [0.25, 0.5, 0.75]],
  cols3: [[1 / 3, 2 / 3], []],
  cols4: [[0.25, 0.5, 0.75], []],
};

/** View-only guides from Settings → Grid & guides; never exported (the ui layer is hidden on export). */
export function GridOverlay({ w, h, pages, zoom }: { w: number; h: number; pages: number; zoom: number }) {
  const grid = useUi((s) => s.grid);
  if (grid === "none") return null;
  const [vs, hs] = GRID_LINES[grid];
  const style = { stroke: "#ff3b8b", strokeWidth: 1 / zoom, opacity: 0.8, dash: grid === "center" ? [6 / zoom, 4 / zoom] : undefined };
  return (
    <Group listening={false}>
      {Array.from({ length: pages }, (_, p) => (
        <Group key={p} x={p * w}>
          {vs.map((f) => (
            <Line key={`v${f}`} points={[f * w, 0, f * w, h]} {...style} />
          ))}
          {hs.map((f) => (
            <Line key={`h${f}`} points={[0, f * h, w, f * h]} {...style} />
          ))}
        </Group>
      ))}
    </Group>
  );
}
