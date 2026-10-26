"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDoc } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { useUi } from "@/lib/store/ui";
import { stageRef } from "@/lib/stageRef";
import { renderThumbnail } from "@/lib/export";
import { saveDump } from "@/lib/persist";

const DEBOUNCE_MS = 1000;

/**
 * Saves the open dump to IndexedDB a second after the last change. Empty, never-edited docs
 * aren't saved, so opening /app/editor/new and leaving doesn't litter the dashboard.
 */
export function useAutosave(routeId: string) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Only user edits count: loading a dump or starting from a template resets undo history,
    // so an untouched template or a merely opened dump isn't written back.
    let dirty = false;

    const save = async () => {
      if (!dirty) return;
      const { doc } = useDoc.getState();
      const { assets, order } = useAssets.getState();
      if (!doc.elements.length && !order.length) return;
      const ui = useUi.getState();
      ui.setSaveState("saving");
      try {
        const thumb = stageRef.current ? renderThumbnail(stageRef.current, doc) : null;
        await saveDump(doc, order.map((id) => assets[id]).filter(Boolean), thumb);
        ui.setSaveState("saved");
        // A dump started from /new gets its real URL once it's worth coming back to.
        if (routeId !== doc.id) router.replace(`/app/editor/${doc.id}`);
      } catch (e) {
        console.error(e);
        ui.setSaveState("error");
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void save(), DEBOUNCE_MS);
    };

    const unsubDoc = useDoc.subscribe((s, prev) => {
      if (s.doc === prev.doc) return;
      // loadDoc/newDoc clear history in the same tick; a real edit leaves a past state behind.
      queueMicrotask(() => {
        if (useDoc.temporal.getState().pastStates.length > 0) {
          dirty = true;
          schedule();
        }
      });
    });
    const unsubAssets = useAssets.subscribe((s, prev) => {
      if (s.order === prev.order) return;
      // replaceAll (loading a dump) swaps the whole list; uploads append to it.
      if (s.order.length > prev.order.length && prev.order.every((id, i) => s.order[i] === id)) {
        dirty = true;
        schedule();
      }
    });
    return () => {
      clearTimeout(timer);
      unsubDoc();
      unsubAssets();
    };
  }, [routeId, router]);
}
