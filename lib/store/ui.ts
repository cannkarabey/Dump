import { create } from "zustand";
import type { Feature } from "@/lib/tiers";

export type LeftPanel = "upload" | "templates" | "text" | "stickers" | "layers";
export type RightTab = "properties" | "assistant";

interface UiState {
  activePanel: LeftPanel;
  rightTab: RightTab;
  zoom: number;
  selection: string[];
  modals: {
    newDump: boolean;
    export: boolean;
    paywall: { open: boolean; feature?: Feature | "maxPhotos" | "maxPages" };
  };
  setActivePanel: (panel: LeftPanel) => void;
  setRightTab: (tab: RightTab) => void;
  setZoom: (zoom: number) => void;
  setSelection: (ids: string[]) => void;
  openModal: (name: "newDump" | "export") => void;
  closeModal: (name: "newDump" | "export") => void;
  openPaywall: (feature?: UiState["modals"]["paywall"]["feature"]) => void;
  closePaywall: () => void;
}

export const ZOOM_MIN = 0.05;
export const ZOOM_MAX = 4;

export const useUi = create<UiState>((set) => ({
  activePanel: "upload",
  rightTab: "properties",
  zoom: 0.45,
  selection: [],
  modals: { newDump: false, export: false, paywall: { open: false } },
  setActivePanel: (activePanel) => set({ activePanel }),
  setRightTab: (rightTab) => set({ rightTab }),
  setZoom: (zoom) => set({ zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) }),
  setSelection: (selection) => set({ selection }),
  openModal: (name) => set((s) => ({ modals: { ...s.modals, [name]: true } })),
  closeModal: (name) => set((s) => ({ modals: { ...s.modals, [name]: false } })),
  openPaywall: (feature) => set((s) => ({ modals: { ...s.modals, paywall: { open: true, feature } } })),
  closePaywall: () => set((s) => ({ modals: { ...s.modals, paywall: { open: false } } })),
}));
