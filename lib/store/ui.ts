import { create } from "zustand";
import type { Feature } from "@/lib/tiers";
import type { BrushTool } from "@/lib/types";

export type LeftPanel = "upload" | "templates" | "stickers" | "text" | "tools" | "filters" | "draw" | "layers" | "settings";
export type GridKind =
  | "none"
  | "thirds"
  | "center"
  | "golden"
  | "cols2"
  | "rows2"
  | "grid2x2"
  | "grid3x2"
  | "grid3x3"
  | "grid4x4"
  | "cols3"
  | "cols4";

export interface BrushState {
  mode: "brush" | "shapes";
  tool: BrushTool | "eraser";
  color: string;
  size: number;
  /** 0–1 */
  opacity: number;
  outline: boolean;
}

function readPref(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writePref(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the preference lasts for this session only.
  }
}
export type RightTab = "properties" | "assistant";

interface UiState {
  activePanel: LeftPanel;
  rightTab: RightTab;
  zoom: number;
  selection: string[];
  /** Page that new elements are placed on. */
  activePage: number;
  /** Shown as a small toast at the bottom of the canvas. */
  notice: string | null;
  /** Autosave status for the TopBar cloud indicator. */
  saveState: "idle" | "saving" | "saved" | "error";
  setSaveState: (state: UiState["saveState"]) => void;
  /** Id of the text element being edited inline on the canvas. */
  editingText: string | null;
  setEditingText: (id: string | null) => void;
  /** Incremented to ask the canvas to fit the artboard to the viewport. */
  fitRequest: number;
  requestFit: () => void;
  modals: {
    newDump: boolean;
    export: boolean;
    paywall: { open: boolean; feature?: Feature | "maxPhotos" | "maxPages" };
  };
  setActivePanel: (panel: LeftPanel) => void;
  setRightTab: (tab: RightTab) => void;
  setZoom: (zoom: number) => void;
  setSelection: (ids: string[]) => void;
  setActivePage: (page: number) => void;
  showNotice: (notice: string | null) => void;
  openModal: (name: "newDump" | "export") => void;
  closeModal: (name: "newDump" | "export") => void;
  openPaywall: (feature?: UiState["modals"]["paywall"]["feature"]) => void;
  closePaywall: () => void;
  /** Settings panel: view-only aids, not part of the doc. */
  grid: GridKind;
  setGrid: (grid: GridKind) => void;
  panMode: boolean;
  setPanMode: (on: boolean) => void;
  darkMode: boolean;
  setDarkMode: (on: boolean) => void;
  brush: BrushState;
  setBrush: (patch: Partial<BrushState>) => void;
}

export const ZOOM_MIN = 0.05;
export const ZOOM_MAX = 4;

export const useUi = create<UiState>((set) => ({
  activePanel: "upload",
  rightTab: "properties",
  zoom: 0.45,
  selection: [],
  activePage: 0,
  notice: null,
  saveState: "idle",
  setSaveState: (saveState) => set({ saveState }),
  editingText: null,
  setEditingText: (editingText) => set({ editingText }),
  fitRequest: 0,
  requestFit: () => set((s) => ({ fitRequest: s.fitRequest + 1 })),
  modals: { newDump: false, export: false, paywall: { open: false } },
  setActivePanel: (activePanel) => set({ activePanel }),
  setRightTab: (rightTab) => set({ rightTab }),
  setZoom: (zoom) => set({ zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) }),
  setSelection: (selection) => set({ selection }),
  setActivePage: (activePage) => set({ activePage }),
  showNotice: (notice) => set({ notice }),
  openModal: (name) => set((s) => ({ modals: { ...s.modals, [name]: true } })),
  closeModal: (name) => set((s) => ({ modals: { ...s.modals, [name]: false } })),
  openPaywall: (feature) => set((s) => ({ modals: { ...s.modals, paywall: { open: true, feature } } })),
  closePaywall: () => set((s) => ({ modals: { ...s.modals, paywall: { open: false } } })),
  grid: "none",
  setGrid: (grid) => set({ grid }),
  panMode: false,
  setPanMode: (panMode) => set({ panMode }),
  darkMode: readPref("dc-dark") !== "0",
  setDarkMode: (darkMode) => {
    writePref("dc-dark", darkMode ? "1" : "0");
    set({ darkMode });
  },
  brush: { mode: "brush", tool: "pen", color: "#ff6b35", size: 8, opacity: 1, outline: false },
  setBrush: (patch) => set((s) => ({ brush: { ...s.brush, ...patch } })),
}));
