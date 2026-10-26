"use client";

import { useEffect, useRef } from "react";
import type Konva from "konva";
import { Transformer } from "react-konva";
import { useUi } from "@/lib/store/ui";
import { useDoc } from "@/lib/store/doc";

const ACCENT = "#7c5cff";

export function SelectionTransformer() {
  const ref = useRef<Konva.Transformer>(null);
  const selection = useUi((s) => s.selection);
  // Re-attach when elements change so new/removed nodes are picked up.
  const elements = useDoc((s) => s.doc.elements);

  useEffect(() => {
    const tr = ref.current;
    const stage = tr?.getStage();
    if (!tr || !stage) return;
    const locked = new Set(elements.filter((el) => el.locked).map((el) => el.id));
    const nodes = selection
      .filter((id) => !locked.has(id))
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => Boolean(n));
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selection, elements]);

  return (
    <Transformer
      ref={ref}
      rotationSnaps={[0, 90, 180, 270]}
      rotationSnapTolerance={6}
      anchorSize={10}
      anchorCornerRadius={3}
      anchorStroke={ACCENT}
      anchorFill="#ffffff"
      borderStroke={ACCENT}
      borderStrokeWidth={1.5}
      ignoreStroke
      flipEnabled={false}
      boundBoxFunc={(oldBox, newBox) =>
        Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20 ? oldBox : newBox
      }
    />
  );
}
