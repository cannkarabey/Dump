"use client";

import type Konva from "konva";
import { Image as KImage, Rect } from "react-konva";
import { useAssets } from "@/lib/store/assets";
import { coverCrop } from "@/lib/geometry";
import type { ImageEl } from "@/lib/types";
import { useElementHandlers } from "./useElementHandlers";

export function ImageNode({ el, single, draggable }: { el: ImageEl; single: boolean; draggable: boolean }) {
  const asset = useAssets((s) => s.assets[el.assetId]);
  const { bake, ...handlers } = useElementHandlers(el);
  const common = {
    ...handlers,
    draggable: handlers.draggable && draggable,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    opacity: el.opacity,
  };

  // Asset not loaded (e.g. after a reload, before persistence lands in S2.4).
  if (!asset) return <Rect {...common} fill="#3a3a3c" cornerRadius={el.radius} />;

  return (
    <KImage
      {...common}
      image={asset.img}
      crop={coverCrop(asset.w, asset.h, el.width, el.height)}
      cornerRadius={el.radius}
      onTransform={(e: Konva.KonvaEventObject<Event>) => {
        // Live re-crop for a single image; multi-selections are baked on transform end.
        if (!single) return;
        const node = e.target as Konva.Image;
        const { width, height } = bake(node);
        node.crop(coverCrop(asset.w, asset.h, width, height));
      }}
    />
  );
}
