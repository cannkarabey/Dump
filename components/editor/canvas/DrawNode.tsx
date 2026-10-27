"use client";

import { Group, Line } from "react-konva";
import type { BrushTool, DrawEl } from "@/lib/types";
import { useElementHandlers } from "./useElementHandlers";

/** How each brush looks; shared by saved strokes and the live stroke while drawing. */
export function brushLook(tool: BrushTool, strokeWidth: number) {
  switch (tool) {
    case "pen":
      return { strokeWidth, tension: 0.35, opacity: 1 };
    case "marker":
      return { strokeWidth: strokeWidth * 2.2, tension: 0.5, opacity: 0.92 };
    case "highlighter":
      return { strokeWidth: strokeWidth * 3.5, tension: 0.3, opacity: 0.45, globalCompositeOperation: "multiply" as const };
  }
}

export function DrawNode({ el, draggable }: { el: DrawEl; draggable: boolean }) {
  const handlers = useElementHandlers(el);
  const look = brushLook(el.tool, el.strokeWidth);
  return (
    <Group
      {...handlers}
      draggable={handlers.draggable && draggable}
      x={el.x}
      y={el.y}
      rotation={el.rotation}
      opacity={el.opacity}
    >
      <Line
        points={el.points}
        stroke={el.stroke}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={Math.max(look.strokeWidth, 24)}
        {...look}
      />
    </Group>
  );
}
