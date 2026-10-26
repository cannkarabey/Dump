import type Konva from "konva";

/** The single editor stage, shared with export (S1.12) and AI thumbnails (S2.8). */
export const stageRef: { current: Konva.Stage | null } = { current: null };
