"use client";

import { useEffect } from "react";
import { useDoc } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { importFiles } from "@/lib/importFiles";

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** Editor keyboard shortcuts and clipboard image paste. */
export function useEditorHotkeys() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      const doc = useDoc.getState();
      const ui = useUi.getState();
      const { undo, redo } = useDoc.temporal.getState();
      const key = e.key.toLowerCase();

      if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && key === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && key === "d") {
        e.preventDefault();
        if (ui.selection.length) ui.setSelection(doc.duplicate(ui.selection));
        return;
      }
      if (mod && key === "a") {
        e.preventDefault();
        ui.setSelection(doc.doc.elements.filter((el) => !el.locked).map((el) => el.id));
        return;
      }
      if (e.key === "Escape") {
        ui.setSelection([]);
        return;
      }
      if (!ui.selection.length) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        doc.removeElements(ui.selection);
        ui.setSelection([]);
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const d = delta[e.key];
      if (d) {
        e.preventDefault();
        const els = doc.doc.elements.filter((el) => ui.selection.includes(el.id) && !el.locked);
        doc.updateElements(els.map((el) => ({ id: el.id, patch: { x: el.x + d[0], y: el.y + d[1] } })));
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      if (isTyping(e.target)) return;
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.length) {
        e.preventDefault();
        void importFiles(files);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("paste", onPaste);
    };
  }, []);
}
