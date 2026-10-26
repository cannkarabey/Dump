import { create } from "zustand";
import { fileToAsset, UnsupportedImageError } from "@/lib/image";
import type { Asset } from "@/lib/types";

interface AssetsState {
  assets: Record<string, Asset>;
  /** Insertion order, used for the upload panel grid. */
  order: string[];
  addFiles: (files: File[]) => Promise<{ added: Asset[]; failed: string[] }>;
  removeAsset: (id: string) => void;
}

export const useAssets = create<AssetsState>((set) => ({
  assets: {},
  order: [],

  addFiles: async (files) => {
    const results = await Promise.allSettled(files.map(fileToAsset));
    const added: Asset[] = [];
    const failed: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") added.push(r.value);
      else failed.push(r.reason instanceof UnsupportedImageError ? r.reason.fileName : files[i].name);
    });
    if (added.length) {
      set((s) => ({
        assets: { ...s.assets, ...Object.fromEntries(added.map((a) => [a.id, a])) },
        order: [...s.order, ...added.map((a) => a.id)],
      }));
    }
    return { added, failed };
  },

  removeAsset: (id) =>
    set((s) => {
      const asset = s.assets[id];
      if (!asset) return s;
      URL.revokeObjectURL(asset.url);
      const assets = { ...s.assets };
      delete assets[id];
      return { assets, order: s.order.filter((a) => a !== id) };
    }),
}));
