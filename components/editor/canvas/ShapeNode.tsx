"use client";

import { Rect } from "react-konva";
import type { ShapeEl } from "@/lib/types";
import { useElementHandlers } from "./useElementHandlers";

export function ShapeNode({ el, draggable }: { el: ShapeEl; draggable: boolean }) {
  const handlers = useElementHandlers(el);
  return (
    <Rect
      {...handlers}
      draggable={handlers.draggable && draggable}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity}
      fill={el.fill}
      cornerRadius={el.radius}
    />
  );
}
