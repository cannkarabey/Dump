"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import { useDoc } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { useUi, ZOOM_MAX, ZOOM_MIN } from "@/lib/store/ui";
import { stageRef } from "@/lib/stageRef";
import { importFiles, placeOnCanvas } from "@/lib/importFiles";
import { ASSET_DRAG_TYPE } from "../panels/UploadPanel";
import { loadEditorFonts } from "@/lib/fonts";
import { PhotoNode } from "./PhotoNode";
import { TextNode } from "./TextNode";
import { ShapeNode } from "./ShapeNode";
import { StickerNode } from "./StickerNode";
import { DrawNode, brushLook } from "./DrawNode";
import { GridOverlay } from "./GridOverlay";
import { commitStroke } from "@/lib/draw";
import { InlineTextEditor } from "./InlineTextEditor";
import { SelectionTransformer } from "./SelectionTransformer";
import type { El } from "@/lib/types";

const PADDING = 48;
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export default function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ownStage = useRef<Konva.Stage | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);

  const doc = useDoc((s) => s.doc);
  const zoom = useUi((s) => s.zoom);
  const selection = useUi((s) => s.selection);
  const editingId = useUi((s) => s.editingText);
  const panMode = useUi((s) => s.panMode);
  const brush = useUi((s) => s.brush);
  const drawing = useUi((s) => s.activePanel === "draw" && s.brush.mode === "brush");
  const erasing = drawing && brush.tool === "eraser";
  const [stroke, setStroke] = useState<number[] | null>(null);
  const strokeRef = useRef<number[] | null>(null);
  const pointerDown = useRef(false);
  const panning = spaceDown || panMode;
  const editingEl = doc.elements.find((el) => el.id === editingId && el.type === "text");
  const { w, h, pages, mode } = doc.format;
  const totalW = w * pages;

  // ---- viewport size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- webfonts: Konva measures text when attrs change, so remount the content layer once fonts load.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    void loadEditorFonts().then(() => setFontsReady(true));
  }, []);

  // ---- zoom & pan
  const prevZoom = useRef(zoom);

  const fitToScreen = useCallback(() => {
    if (!size.width || !size.height) return;
    const z = clampZoom(Math.min((size.width - PADDING * 2) / totalW, (size.height - PADDING * 2) / h));
    prevZoom.current = z;
    useUi.getState().setZoom(z);
    setPan({ x: (size.width - totalW * z) / 2, y: (size.height - h * z) / 2 });
  }, [size.width, size.height, totalW, h]);

  // Auto-fit on format change and on viewport resize, until the user zooms or pans themselves.
  const userAdjusted = useRef(false);
  const formatKey = `${w}x${h}x${pages}`;
  const fittedFor = useRef("");
  useEffect(() => {
    if (!size.width) return;
    if (fittedFor.current !== formatKey) {
      fittedFor.current = formatKey;
      userAdjusted.current = false;
    }
    if (!userAdjusted.current) fitToScreen();
  }, [formatKey, size.width, size.height, fitToScreen]);

  // Explicit "fit" from the toolbar.
  useEffect(
    () =>
      useUi.subscribe((s, prev) => {
        if (s.fitRequest === prev.fitRequest) return;
        userAdjusted.current = false;
        fitToScreen();
      }),
    [fitToScreen],
  );

  // Zoom changed from the toolbar: keep the viewport center fixed.
  useEffect(() => {
    if (prevZoom.current === zoom) return;
    userAdjusted.current = true;
    const k = zoom / prevZoom.current;
    prevZoom.current = zoom;
    const cx = size.width / 2;
    const cy = size.height / 2;
    setPan((p) => ({ x: cx - (cx - p.x) * k, y: cy - (cy - p.y) * k }));
  }, [zoom, size.width, size.height]);

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    userAdjusted.current = true;
    const stage = e.target.getStage();
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Pinch / ctrl+wheel: zoom around the pointer.
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;
      const next = clampZoom(zoom * Math.exp(-e.evt.deltaY * 0.01));
      const k = next / zoom;
      prevZoom.current = next;
      useUi.getState().setZoom(next);
      setPan((p) => ({ x: pointer.x - (pointer.x - p.x) * k, y: pointer.y - (pointer.y - p.y) * k }));
    } else {
      setPan((p) => ({ x: p.x - e.evt.deltaX, y: p.y - e.evt.deltaY }));
    }
  };

  // ---- space + drag to pan
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping(e.target)) {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const up = (e: KeyboardEvent) => e.code === "Space" && setSpaceDown(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ---- freehand drawing (Draw panel, brush mode)
  const eraseAt = (stage: Konva.Stage) => {
    const pointer = stage.getPointerPosition();
    const hit = pointer && stage.getIntersection(pointer)?.findAncestor(".element", true);
    const el = hit && useDoc.getState().doc.elements.find((x) => x.id === hit.id());
    if (el?.type === "draw") useDoc.getState().removeElements([el.id]);
  };

  const onDrawDown = (stage: Konva.Stage) => {
    pointerDown.current = true;
    if (erasing) return eraseAt(stage);
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    strokeRef.current = [pos.x, pos.y];
    setStroke(strokeRef.current);
  };

  const onPointerMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!drawing || !pointerDown.current) return;
    const stage = e.target.getStage();
    if (!stage) return;
    if (erasing) return eraseAt(stage);
    const pos = stage.getRelativePointerPosition();
    const pts = strokeRef.current;
    if (!pos || !pts) return;
    // Skip points closer than ~2 screen px to keep strokes light.
    const dx = pos.x - pts[pts.length - 2];
    const dy = pos.y - pts[pts.length - 1];
    if (dx * dx + dy * dy < (2 / zoom) ** 2) return;
    strokeRef.current = [...pts, pos.x, pos.y];
    setStroke(strokeRef.current);
  };

  const onPointerUp = () => {
    pointerDown.current = false;
    const pts = strokeRef.current;
    strokeRef.current = null;
    setStroke(null);
    if (pts && brush.tool !== "eraser") commitStroke(pts, brush.tool, brush.color, brush.size, brush.opacity);
  };

  // ---- selection on empty space
  const onStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const target = e.target;
    if (drawing && !panning) {
      const stage = target.getStage();
      if (stage) onDrawDown(stage);
      return;
    }
    const onEmpty = target === target.getStage() || target.hasName("artboard");
    if (!onEmpty) return;
    useUi.getState().setSelection([]);
    const pos = target.getStage()?.getRelativePointerPosition();
    if (pos) useUi.getState().setActivePage(Math.min(pages - 1, Math.max(0, Math.floor(pos.x / w))));
  };

  // ---- drop from the upload panel or the desktop
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointersPositions(e);
    const pos = stage.getRelativePointerPosition();
    if (pos) useUi.getState().setActivePage(Math.min(pages - 1, Math.max(0, Math.floor(pos.x / w))));

    const assetId = e.dataTransfer.getData(ASSET_DRAG_TYPE);
    if (!assetId) {
      void importFiles([...e.dataTransfer.files]);
      return;
    }
    const asset = useAssets.getState().assets[assetId];
    if (!asset || !pos) return;

    // Dropped onto a slot → fill it; anywhere else → place centered on the pointer.
    const hit = stage.getIntersection(stage.getPointerPosition()!)?.findAncestor(".element", true);
    const hitEl = hit && useDoc.getState().doc.elements.find((el) => el.id === hit.id());
    if (hitEl?.type === "slot") {
      useDoc.getState().updateElement(hitEl.id, { assetId });
      return;
    }
    placeOnCanvas([asset]);
    const placed = useUi.getState().selection[0];
    const el = useDoc.getState().doc.elements.find((x) => x.id === placed);
    if (el) useDoc.getState().updateElement(el.id, { x: pos.x - el.width / 2, y: pos.y - el.height / 2 });
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ cursor: panning ? "grab" : drawing ? "crosshair" : undefined }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {size.width > 0 && (
        <Stage
          ref={(s) => {
            // Next keeps previous routes mounted but hidden; a hidden editor detaching its
            // stage must not clear the visible one's.
            if (s) {
              ownStage.current = s;
              stageRef.current = s;
            } else if (stageRef.current === ownStage.current) {
              stageRef.current = null;
            }
          }}
          width={size.width}
          height={size.height}
          x={pan.x}
          y={pan.y}
          scaleX={zoom}
          scaleY={zoom}
          draggable={panning}
          onDragEnd={(e) => {
            if (e.target !== e.target.getStage()) return;
            userAdjusted.current = true;
            setPan({ x: e.target.x(), y: e.target.y() });
          }}
          onWheel={onWheel}
          onMouseDown={onStageMouseDown}
          onTouchStart={onStageMouseDown}
          onMouseMove={onPointerMove}
          onTouchMove={onPointerMove}
          onMouseUp={onPointerUp}
          onTouchEnd={onPointerUp}
          onMouseLeave={() => pointerDown.current && onPointerUp()}
        >
          <Layer name="bg">
            <Rect
              name="artboard"
              width={totalW}
              height={h}
              fill={doc.background === "transparent" ? "#f2f2f2" : doc.background}
              shadowColor="#000"
              shadowOpacity={0.35}
              shadowBlur={24 / zoom}
              shadowOffsetY={8 / zoom}
            />
          </Layer>

          <Layer
            key={fontsReady ? "fonts" : "fallback"}
            name="content"
            clipX={0}
            clipY={0}
            clipWidth={totalW}
            clipHeight={h}
            // While drawing, strokes go to the stage; only the eraser needs to hit elements.
            listening={!drawing || erasing}
          >
            {doc.elements.map((el) => (
              <ElementNode key={el.id} el={el} single={selection.length === 1} draggable={!panning && !drawing} />
            ))}
            {stroke && brush.tool !== "eraser" && (
              <Line
                points={stroke}
                stroke={brush.color}
                lineCap="round"
                lineJoin="round"
                listening={false}
                {...brushLook(brush.tool, brush.size * (w / 1080))}
                opacity={brushLook(brush.tool, 1).opacity * brush.opacity}
              />
            )}
          </Layer>

          <Layer name="ui">
            <GridOverlay w={w} h={h} pages={pages} zoom={zoom} />
            {mode === "carousel" &&
              Array.from({ length: pages }, (_, i) => (
                <Group key={i} listening={false}>
                  {i > 0 && (
                    <Line
                      points={[i * w, 0, i * w, h]}
                      stroke="#7c5cff"
                      strokeWidth={1.5 / zoom}
                      dash={[8 / zoom, 6 / zoom]}
                    />
                  )}
                  <Text
                    x={i * w}
                    y={-22 / zoom}
                    width={w}
                    align="center"
                    text={`${i + 1}/${pages}`}
                    fontSize={13 / zoom}
                    fill="#8e8e93"
                  />
                </Group>
              ))}
            <SelectionTransformer />
          </Layer>
        </Stage>
      )}
      {editingEl?.type === "text" && <InlineTextEditor key={editingEl.id} el={editingEl} zoom={zoom} pan={pan} />}
    </div>
  );
}

function ElementNode({ el, single, draggable }: { el: El; single: boolean; draggable: boolean }) {
  switch (el.type) {
    case "image":
    case "slot":
      return <PhotoNode el={el} single={single} draggable={draggable} />;
    case "text":
      return <TextNode el={el} draggable={draggable} />;
    case "shape":
      return <ShapeNode el={el} draggable={draggable} />;
    case "sticker":
      return <StickerNode el={el} draggable={draggable} />;
    case "draw":
      return <DrawNode el={el} draggable={draggable} />;
  }
}
