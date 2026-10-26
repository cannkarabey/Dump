import type { DumpMode, FontKey, Frame } from "@/lib/types";

/**
 * Template coordinates are page-relative and normalized: nx/nw are fractions of the page width,
 * ny/nh of the page height. nx can exceed 1 (or nw span several pages) for seamless layouts.
 */
interface TplBase {
  page: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
  rotation?: number;
}

export type TplEl =
  | (TplBase & { type: "slot"; frame?: Frame; /** fraction of page width */ nradius?: number })
  | (TplBase & {
      type: "text";
      /** May contain {{month}} and {{year}}. */
      text: string;
      font: FontKey;
      /** Font size as a fraction of page height. */
      nfs: number;
      fontStyle?: string;
      fill: string;
      align: "left" | "center" | "right";
      bubble?: boolean;
    })
  | (TplBase & { type: "shape"; fill: string; nradius?: number });

export interface Template {
  id: string;
  title: string;
  tier: "free" | "creator";
  mode: DumpMode;
  pages: number;
  background: string;
  tags: string[];
  elements: TplEl[];
}
