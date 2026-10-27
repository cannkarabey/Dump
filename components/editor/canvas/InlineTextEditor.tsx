"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useDoc } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { fontFamilyFor } from "@/lib/fonts";
import type { TextEl } from "@/lib/types";
import { at } from "@/lib/i18n/appDictionary";

/**
 * Konva's recommended pattern for editing canvas text: overlay a textarea that matches the
 * node's on-screen position, font and rotation, then write the result back on blur.
 */
export function InlineTextEditor({ el, zoom, pan }: { el: TextEl; zoom: number; pan: { x: number; y: number } }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const cancelled = useRef(false);
  const pad = el.bubble ? el.fontSize * 0.45 : 0;

  const fitHeight = () => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  };

  useLayoutEffect(fitHeight);
  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.focus();
    ta.select();
  }, []);

  const finish = () => {
    const ta = ref.current;
    if (ta && !cancelled.current && ta.value !== el.text) {
      useDoc.getState().updateElement(el.id, { text: ta.value || " " });
    }
    useUi.getState().setEditingText(null);
  };

  return (
    <textarea
      ref={ref}
      defaultValue={el.text}
      aria-label={at().editor.editText}
      spellCheck={false}
      onInput={fitHeight}
      onBlur={finish}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
        } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.currentTarget.blur();
        }
      }}
      style={{
        position: "absolute",
        left: pan.x + el.x * zoom,
        top: pan.y + el.y * zoom,
        width: el.width * zoom,
        padding: pad * zoom,
        fontFamily: fontFamilyFor(el.fontFamily),
        fontSize: el.fontSize * zoom,
        fontWeight: el.fontStyle === "bold" ? 700 : el.fontStyle && /^\d+$/.test(el.fontStyle) ? Number(el.fontStyle) : 400,
        fontStyle: el.fontStyle?.includes("italic") ? "italic" : "normal",
        letterSpacing: el.letterSpacing ? el.letterSpacing * zoom : undefined,
        lineHeight: 1.05,
        color: el.fill,
        textAlign: el.align,
        transform: `rotate(${el.rotation}deg)`,
        transformOrigin: "top left",
        background: el.bubble ? "#ffffff" : "transparent",
        borderRadius: el.bubble ? el.fontSize * 0.9 * zoom : 4,
        outline: "2px solid #7c5cff",
        border: "none",
        resize: "none",
        overflow: "hidden",
        whiteSpace: "pre-wrap",
        zIndex: 10,
      }}
    />
  );
}
