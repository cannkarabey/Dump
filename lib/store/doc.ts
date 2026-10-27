import { create, useStore } from "zustand";
import { temporal, type TemporalState } from "zundo";
import { nanoid } from "nanoid";
import type { DumpDoc, DumpFormat, El } from "@/lib/types";
import { at } from "@/lib/i18n/appDictionary";

export const DEFAULT_FORMAT: DumpFormat = { w: 1080, h: 1440, pages: 1, mode: "single" };

export function createDoc(format: DumpFormat = DEFAULT_FORMAT, id = nanoid(10)): DumpDoc {
  return {
    id,
    title: at().editor.untitled,
    format,
    background: "#ffffff",
    elements: [],
    updatedAt: Date.now(),
  };
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type DistributivePartial<T> = T extends unknown ? Partial<T> : never;

/** A partial update of any element kind; `id` and `type` are immutable. */
export type ElPatch = DistributivePartial<DistributiveOmit<El, "id" | "type">>;

interface DocState {
  doc: DumpDoc;
  /** Replaces the doc and clears undo history (new or loaded dump). */
  newDoc: (format: DumpFormat, id?: string) => DumpDoc;
  /** Loads a saved dump (or a template start) with a fresh undo history. */
  loadDoc: (doc: DumpDoc) => void;
  /** Replaces the doc as a single undoable step (templates, month dump). */
  replaceDoc: (doc: DumpDoc) => void;
  setTitle: (title: string) => void;
  setFormat: (format: DumpFormat) => void;
  setBackground: (color: string) => void;
  addElements: (els: El[]) => void;
  updateElement: (id: string, patch: ElPatch) => void;
  updateElements: (patches: { id: string; patch: ElPatch }[]) => void;
  removeElements: (ids: string[]) => void;
  /** Returns the ids of the copies. */
  duplicate: (ids: string[]) => string[];
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  addPage: () => void;
  /** Inserts a copy of page `index` right after it. */
  duplicatePage: (index: number) => void;
  removePage: (index: number) => void;
  /** Changes the page size, re-laying out elements proportionally. */
  resize: (w: number, h: number) => void;
}

/** Applies the patch only when it changes something, so no-op drags don't create history entries. */
function patchEl(el: El, patch: ElPatch): El {
  const changed = (Object.keys(patch) as (keyof ElPatch)[]).some(
    (k) => (el as unknown as Record<string, unknown>)[k] !== patch[k],
  );
  return changed ? ({ ...el, ...patch } as El) : el;
}

export const useDoc = create<DocState>()(
  temporal(
    (set, get) => {
      const commit = (fn: (doc: DumpDoc) => DumpDoc) =>
        set((s) => {
          const next = fn(s.doc);
          return next === s.doc ? s : { doc: { ...next, updatedAt: Date.now() } };
        });

      return {
        doc: createDoc(),

        newDoc: (format, id) => {
          const doc = createDoc(format, id);
          set({ doc });
          useDoc.temporal.getState().clear();
          return doc;
        },
        loadDoc: (doc) => {
          set({ doc });
          useDoc.temporal.getState().clear();
        },
        replaceDoc: (doc) => commit(() => doc),
        setTitle: (title) => commit((d) => (d.title === title ? d : { ...d, title })),
        setFormat: (format) => commit((d) => ({ ...d, format })),
        setBackground: (background) => commit((d) => (d.background === background ? d : { ...d, background })),

        addElements: (els) => commit((d) => ({ ...d, elements: [...d.elements, ...els] })),

        updateElement: (id, patch) => get().updateElements([{ id, patch }]),

        updateElements: (patches) =>
          commit((d) => {
            const byId = new Map(patches.map((p) => [p.id, p.patch]));
            let changed = false;
            const elements = d.elements.map((el) => {
              const patch = byId.get(el.id);
              if (!patch) return el;
              const next = patchEl(el, patch);
              if (next !== el) changed = true;
              return next;
            });
            return changed ? { ...d, elements } : d;
          }),

        removeElements: (ids) =>
          commit((d) => {
            const drop = new Set(ids);
            const elements = d.elements.filter((el) => !drop.has(el.id));
            return elements.length === d.elements.length ? d : { ...d, elements };
          }),

        duplicate: (ids) => {
          const source = get().doc.elements.filter((el) => ids.includes(el.id));
          const copies = source.map((el) => ({ ...el, id: nanoid(10), x: el.x + 40, y: el.y + 40 }));
          if (copies.length) commit((d) => ({ ...d, elements: [...d.elements, ...copies] }));
          return copies.map((c) => c.id);
        },

        bringForward: (id) =>
          commit((d) => {
            const i = d.elements.findIndex((el) => el.id === id);
            if (i < 0 || i === d.elements.length - 1) return d;
            const elements = [...d.elements];
            [elements[i], elements[i + 1]] = [elements[i + 1], elements[i]];
            return { ...d, elements };
          }),

        sendBackward: (id) =>
          commit((d) => {
            const i = d.elements.findIndex((el) => el.id === id);
            if (i <= 0) return d;
            const elements = [...d.elements];
            [elements[i - 1], elements[i]] = [elements[i], elements[i - 1]];
            return { ...d, elements };
          }),

        // A single post becomes a carousel once it has more than one page.
        addPage: () =>
          commit((d) => ({ ...d, format: { ...d.format, mode: "carousel", pages: d.format.pages + 1 } })),

        duplicatePage: (index) =>
          commit((d) => {
            const { w } = d.format;
            const onPage = d.elements.filter((el) => pageOf(el, w, d.format.pages) === index);
            const shifted = d.elements.map((el) =>
              pageOf(el, w, d.format.pages) > index ? { ...el, x: el.x + w } : el,
            );
            const copies = onPage.map((el) => ({ ...el, id: nanoid(10), x: el.x + w }));
            return {
              ...d,
              elements: [...shifted, ...copies],
              format: { ...d.format, mode: "carousel", pages: d.format.pages + 1 },
            };
          }),

        resize: (w, h) =>
          commit((d) => {
            const { w: ow, h: oh, pages } = d.format;
            if (ow === w && oh === h) return d;
            const sx = w / ow;
            const sy = h / oh;
            // Positions follow the page proportionally; sizes scale uniformly so photos don't distort.
            const s = Math.min(sx, sy);
            const elements = d.elements.map((el) => {
              const page = pageOf(el, ow, pages);
              const cx = (el.x + el.width / 2 - page * ow) * sx + page * w;
              const cy = (el.y + el.height / 2) * sy;
              const width = el.width * s;
              const height = el.height * s;
              const scaled = { ...el, x: cx - width / 2, y: cy - height / 2, width, height };
              if (el.type === "draw") return { ...scaled, points: el.points.map((v) => v * s), strokeWidth: el.strokeWidth * s };
              return el.type === "text"
                ? { ...scaled, fontSize: el.fontSize * s, letterSpacing: el.letterSpacing && el.letterSpacing * s }
                : scaled;
            });
            return { ...d, elements, format: { ...d.format, w, h } };
          }),

        removePage: (index) =>
          commit((d) => {
            if (d.format.pages <= 1) return d;
            const { w } = d.format;
            const left = index * w;
            const right = left + w;
            const elements = d.elements
              // An element belongs to the page its center sits on.
              .filter((el) => {
                const cx = el.x + el.width / 2;
                return cx < left || cx >= right;
              })
              .map((el) => (el.x >= right ? { ...el, x: el.x - w } : el));
            const pages = d.format.pages - 1;
            return { ...d, elements, format: { ...d.format, pages, mode: pages === 1 ? "single" : d.format.mode } };
          }),
      };
    },
    {
      limit: 100,
      partialize: (s) => ({ doc: s.doc }),
      equality: (a, b) => a.doc === b.doc,
    },
  ),
);

type DocHistory = TemporalState<{ doc: DumpDoc }>;

/** Selectors must return stable values (primitives), since there is no custom equality. */
export function useDocHistory<T>(selector: (s: DocHistory) => T): T {
  return useStore(useDoc.temporal, selector);
}

export function pageOf(el: Pick<El, "x" | "width">, pageWidth: number, pages: number): number {
  const page = Math.floor((el.x + el.width / 2) / pageWidth);
  return Math.min(pages - 1, Math.max(0, page));
}
