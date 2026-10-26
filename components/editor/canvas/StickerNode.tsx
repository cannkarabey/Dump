"use client";

import { useEffect, useState } from "react";
import { Image as KImage, Rect } from "react-konva";
import type { StickerEl } from "@/lib/types";
import { useElementHandlers } from "./useElementHandlers";

const cache = new Map<string, HTMLImageElement>();

function useImage(src: string) {
  const [img, setImg] = useState<HTMLImageElement | undefined>(() => {
    const hit = cache.get(src);
    return hit?.complete ? hit : undefined;
  });
  useEffect(() => {
    let el = cache.get(src);
    if (!el) {
      el = new Image();
      el.src = src;
      cache.set(src, el);
    }
    const image = el;
    let alive = true;
    // decode() also resolves for images that finished loading before this effect ran.
    image
      .decode()
      .then(() => alive && setImg(image))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);
  return img;
}

export function StickerNode({ el, draggable }: { el: StickerEl; draggable: boolean }) {
  const handlers = useElementHandlers(el);
  const img = useImage(el.src);
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
  // Invisible hit box until the SVG has loaded, so it can still be selected.
  return img ? <KImage {...common} image={img} /> : <Rect {...common} fill="transparent" />;
}
