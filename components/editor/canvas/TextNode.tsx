"use client";

import { Label, Tag, Text } from "react-konva";
import { fontFamilyFor } from "@/lib/fonts";
import { useUi } from "@/lib/store/ui";
import type { TextEl } from "@/lib/types";
import { useElementHandlers } from "./useElementHandlers";

/** Double-click opens the inline editor (InlineTextEditor); the node hides meanwhile. */
export function TextNode({ el, draggable }: { el: TextEl; draggable: boolean }) {
  const handlers = useElementHandlers(el);
  const editing = useUi((s) => s.editingText === el.id);
  const startEditing = () => !el.locked && useUi.getState().setEditingText(el.id);

  const text = (
    <Text
      text={el.text}
      width={el.width}
      fontFamily={fontFamilyFor(el.fontFamily)}
      fontSize={el.fontSize}
      fontStyle={el.fontStyle ?? "normal"}
      fill={el.fill}
      align={el.align}
      lineHeight={1.05}
      padding={el.bubble ? el.fontSize * 0.45 : 0}
    />
  );

  return (
    <Label
      {...handlers}
      draggable={handlers.draggable && draggable && !editing}
      x={el.x}
      y={el.y}
      rotation={el.rotation}
      opacity={editing ? 0 : el.opacity}
      onDblClick={startEditing}
      onDblTap={startEditing}
    >
      {el.bubble && (
        <Tag
          fill="#ffffff"
          cornerRadius={el.fontSize * 0.9}
          shadowColor="#000"
          shadowOpacity={0.15}
          shadowBlur={el.fontSize * 0.4}
        />
      )}
      {text}
    </Label>
  );
}
