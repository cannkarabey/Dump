"use client";

import { Arrow, Ellipse, Group, Line, Path, Rect, Star } from "react-konva";
import type { ShapeEl } from "@/lib/types";
import { useElementHandlers } from "./useElementHandlers";

const HEART = "M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 6 3.6 2.4-2.4 3.8-3.6 6-3.6 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z";

/** Rectangles (palette chips, Draw → Shapes) and the other basic shapes, drawn in a w×h box. */
export function ShapeNode({ el, draggable }: { el: ShapeEl; draggable: boolean }) {
  const handlers = useElementHandlers(el);
  const { width: w, height: h } = el;
  const kind = el.kind ?? "rect";
  const sw = el.strokeWidth ?? Math.max(2, Math.min(w, h) * 0.04);
  const paint = el.outline
    ? { stroke: el.fill, strokeWidth: sw, fill: "transparent", strokeScaleEnabled: false }
    : { fill: el.fill };

  let shape: React.ReactNode;
  switch (kind) {
    case "rect":
      shape = <Rect width={w} height={h} cornerRadius={el.radius} {...paint} />;
      break;
    case "rounded":
      shape = <Rect width={w} height={h} cornerRadius={Math.min(w, h) * 0.22} {...paint} />;
      break;
    case "ellipse":
      shape = <Ellipse x={w / 2} y={h / 2} radiusX={w / 2} radiusY={h / 2} {...paint} />;
      break;
    case "triangle":
      shape = <Line points={[w / 2, 0, w, h, 0, h]} closed lineJoin="round" {...paint} />;
      break;
    case "star":
      shape = <Star x={w / 2} y={h / 2} numPoints={5} outerRadius={w / 2} innerRadius={w * 0.21} scaleY={h / w} {...paint} />;
      break;
    case "heart":
      shape = <Path data={HEART} y={-h * 0.08} scaleX={w / 24} scaleY={(h * 1.12) / 24} {...paint} />;
      break;
    case "line":
      shape = <Line points={[0, h / 2, w, h / 2]} stroke={el.fill} strokeWidth={sw} lineCap="round" hitStrokeWidth={Math.max(sw, 24)} />;
      break;
    case "arrow":
      shape = (
        <Arrow
          points={[0, h / 2, w - sw, h / 2]}
          stroke={el.fill}
          fill={el.fill}
          strokeWidth={sw}
          pointerLength={sw * 3}
          pointerWidth={sw * 3}
          lineCap="round"
          hitStrokeWidth={Math.max(sw, 24)}
        />
      );
      break;
  }

  return (
    <Group
      {...handlers}
      draggable={handlers.draggable && draggable}
      x={el.x}
      y={el.y}
      width={w}
      height={h}
      rotation={el.rotation}
      opacity={el.opacity}
    >
      {shape}
    </Group>
  );
}
