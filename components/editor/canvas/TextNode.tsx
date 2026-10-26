"use client";

import { Label, Tag, Text } from "react-konva";
import { fontFamilyFor } from "@/lib/fonts";
import type { TextEl } from "@/lib/types";
import { useElementHandlers } from "./useElementHandlers";

/** Display-only text; inline editing arrives with the text panel in S1.13. */
export function TextNode({ el, draggable }: { el: TextEl; draggable: boolean }) {
  const handlers = useElementHandlers(el);
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

  const common = {
    ...handlers,
    draggable: handlers.draggable && draggable,
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    opacity: el.opacity,
  };

  if (el.bubble) {
    return (
      <Label {...common}>
        <Tag fill="#ffffff" cornerRadius={el.fontSize * 0.9} shadowColor="#000" shadowOpacity={0.15} shadowBlur={el.fontSize * 0.4} />
        {text}
      </Label>
    );
  }
  return <Label {...common}>{text}</Label>;
}
