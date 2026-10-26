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
import { ImageNode } from "./ImageNode";
import { SelectionTransformer } from "./SelectionTransformer";
import type { El } from "@/lib/types";

const PADDING = 48;
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export default function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);

  const doc = useDoc((s) => s.doc);
  const zoom = useUi((s) => s.zoom);
  const selection = useUi((s) => s.selection);
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

  // ---- selection on empty space
  const onStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const target = e.target;
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
    const hit = stage.getIntersection(stage.getPointerPosition()!);
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
      style={{ cursor: spaceDown ? "grab" : undefined }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {size.width > 0 && (
        <Stage
          ref={(s) => {
            stageRef.current = s;
          }}
          width={size.width}
          height={size.height}
          x={pan.x}
          y={pan.y}
          scaleX={zoom}
          scaleY={zoom}
          draggable={spaceDown}
          onDragEnd={(e) => {
            if (e.target !== e.target.getStage()) return;
            userAdjusted.current = true;
            setPan({ x: e.target.x(), y: e.target.y() });
          }}
          onWheel={onWheel}
          onMouseDown={onStageMouseDown}
          onTouchStart={onStageMouseDown}
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

          <Layer name="content" clipX={0} clipY={0} clipWidth={totalW} clipHeight={h}>
            {doc.elements.map((el) => (
              <ElementNode key={el.id} el={el} single={selection.length === 1} draggable={!spaceDown} />
            ))}
          </Layer>

          <Layer name="ui">
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
    </div>
  );
}

function ElementNode({ el, single, draggable }: { el: El; single: boolean; draggable: boolean }) {
  switch (el.type) {
    case "image":
      return <ImageNode el={el} single={single} draggable={draggable} />;
    // Slots (S1.8), text and stickers (S1.13) render once their tasks land.
    default:
      return null;
  }
}
