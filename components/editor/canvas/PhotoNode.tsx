"use client";

import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Group, Image as KImage, Rect, Text } from "react-konva";
import { useAssets } from "@/lib/store/assets";
import { coverCrop } from "@/lib/geometry";
import { fontFamilyFor } from "@/lib/fonts";
import { stampLabel } from "@/lib/month";
import { at } from "@/lib/i18n/appDictionary";
import { pickFiles } from "@/lib/importFiles";
import { filterAttrs, filterDef } from "@/lib/filters";
import type { ImageEl, SlotEl } from "@/lib/types";
import { bakeSize, useElementHandlers } from "./useElementHandlers";
import { filmHoles, frameInsets } from "./frames";

const ACCENT = "#7c5cff";

/** Images and template slots: optional polaroid/film frame, cover-cropped photo, date stamp. */
export function PhotoNode({
  el,
  single,
  draggable,
}: {
  el: ImageEl | SlotEl;
  single: boolean;
  draggable: boolean;
}) {
  const asset = useAssets((s) => (el.assetId ? s.assets[el.assetId] : undefined));
  const { onTransformEnd, ...handlers } = useElementHandlers(el);
  // Size while a single node is being transformed, so the frame and crop re-layout live.
  const [live, setLive] = useState<{ width: number; height: number } | null>(null);

  const w = live?.width ?? el.width;
  const h = live?.height ?? el.height;
  const inset = frameInsets(el.frame, w, h);
  const inner = { x: inset.left, y: inset.top, width: w - inset.left - inset.right, height: h - inset.top - inset.bottom };
  const s = Math.min(w, h);
  const radius = el.frame && el.frame !== "none" ? 0 : el.radius;
  const crop = asset ? coverCrop(asset.w, asset.h, inner.width, inner.height) : undefined;

  // Konva filters work on a cached bitmap. Cache near the photo's own resolution (capped) so
  // exports stay sharp, and re-cache whenever the filter, size or photo changes.
  const imageRef = useRef<Konva.Image>(null);
  const def = filterDef(el.filter);
  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;
    if (!def || !crop) {
      node.clearCache();
      node.filters([]);
      return;
    }
    const pixelRatio = Math.min(3, Math.max(1, crop.width / Math.max(1, inner.width)));
    (node as Konva.Node).setAttrs(filterAttrs(def, inner.width * pixelRatio));
    node.filters(def.filters);
    node.cache({ pixelRatio });
    node.getLayer()?.batchDraw();
  }, [def, crop?.width, crop?.height, crop?.x, crop?.y, inner.width, inner.height, radius]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Group
      {...handlers}
      draggable={handlers.draggable && draggable}
      x={el.x}
      y={el.y}
      width={w}
      height={h}
      rotation={el.rotation}
      opacity={el.opacity}
      onTransform={(e: Konva.KonvaEventObject<Event>) => {
        if (!single) return;
        setLive(bakeSize(e.target));
      }}
      onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
        onTransformEnd(e);
        setLive(null);
      }}
      onDblClick={() => el.type === "slot" && !el.assetId && pickFiles({ slotId: el.id })}
      onDblTap={() => el.type === "slot" && !el.assetId && pickFiles({ slotId: el.id })}
    >
      {el.frame === "polaroid" && (
        <Rect
          width={w}
          height={h}
          fill="#fdfcf8"
          cornerRadius={s * 0.008}
          shadowColor="#000"
          shadowOpacity={0.22}
          shadowBlur={s * 0.04}
          shadowOffsetY={s * 0.015}
        />
      )}
      {el.frame === "film" && (
        <>
          <Rect width={w} height={h} fill="#0d0d0d" />
          {filmHoles(w, h).map((r, i) => (
            <Rect key={i} {...r} fill="#e9e6df" cornerRadius={Math.min(r.width, r.height) * 0.2} />
          ))}
        </>
      )}

      {asset ? (
        <KImage
          ref={imageRef}
          {...inner}
          image={asset.img}
          crop={crop}
          cornerRadius={radius}
        />
      ) : el.type === "slot" ? (
        <>
          <Rect
            {...inner}
            fill="#7c5cff14"
            stroke={ACCENT}
            strokeWidth={s * 0.005}
            dash={[s * 0.025, s * 0.018]}
            cornerRadius={radius}
          />
          <Text
            {...inner}
            // Konva renders through its own reconciler; module locale avoids relying on context bridging.
            text={at().editor.slotPlaceholder}
            align="center"
            verticalAlign="middle"
            fontSize={Math.max(14, s * 0.06)}
            fontFamily={fontFamilyFor("inter")}
            fontStyle="600"
            fill={ACCENT}
            listening={false}
          />
        </>
      ) : (
        // Image whose asset isn't in memory (e.g. after a reload, before persistence lands in S2.4).
        <Rect {...inner} fill="#3a3a3c" cornerRadius={radius} />
      )}

      {el.stamp && asset?.takenAt != null && (
        <Text
          x={inner.x}
          y={inner.y + inner.height - inner.height * 0.11}
          width={inner.width - inner.width * 0.05}
          height={inner.height * 0.1}
          align="right"
          verticalAlign="middle"
          text={stampLabel(asset.takenAt)}
          fontFamily={fontFamilyFor("vt323")}
          fontSize={Math.max(12, Math.min(inner.width, inner.height) * 0.085)}
          fill="#ffa41f"
          shadowColor="#ff6a00"
          shadowBlur={Math.min(inner.width, inner.height) * 0.025}
          shadowOpacity={0.9}
          listening={false}
        />
      )}
    </Group>
  );
}
