import type Konva from "konva";
import { pageOf, useDoc, type ElPatch } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import type { El } from "@/lib/types";

const MIN_SIZE = 20;

/** Bakes the node's scale into width/height so crops and frames stay crisp. */
export function bakeSize(node: Konva.Node) {
  const width = Math.max(MIN_SIZE, node.width() * node.scaleX());
  const height = Math.max(MIN_SIZE, node.height() * node.scaleY());
  node.setAttrs({ width, height, scaleX: 1, scaleY: 1 });
  return { width, height };
}

/** Turns a transformed node back into a doc patch; text scales its font instead of its box. */
function transformPatch(node: Konva.Node, el: El): ElPatch {
  const pos = { x: node.x(), y: node.y(), rotation: node.rotation() };
  if (el.type === "text") {
    const scale = node.scaleX();
    node.scale({ x: 1, y: 1 });
    return {
      ...pos,
      fontSize: el.fontSize * scale,
      width: el.width * scale,
      ...(el.letterSpacing ? { letterSpacing: el.letterSpacing * scale } : {}),
    };
  }
  if (el.type === "draw") {
    const sx = node.scaleX();
    const sy = node.scaleY();
    node.scale({ x: 1, y: 1 });
    return {
      ...pos,
      width: el.width * sx,
      height: el.height * sy,
      points: el.points.map((v, i) => (i % 2 ? v * sy : v * sx)),
    };
  }
  return { ...pos, ...bakeSize(node) };
}

/** Selection, drag and transform handlers shared by every element node. */
export function useElementHandlers(el: El) {
  const select = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { selection, setSelection } = useUi.getState();
    const additive = "shiftKey" in e.evt && e.evt.shiftKey;
    if (additive) {
      setSelection(selection.includes(el.id) ? selection.filter((id) => id !== el.id) : [...selection, el.id]);
    } else if (!selection.includes(el.id)) {
      setSelection([el.id]);
    }
  };

  /** Ids moved/transformed together with this element. */
  const groupIds = () => {
    const { selection } = useUi.getState();
    return selection.includes(el.id) ? selection : [el.id];
  };

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const patches = groupIds().flatMap((id) => {
      const node = stage.findOne(`#${id}`);
      return node ? [{ id, patch: { x: node.x(), y: node.y() } }] : [];
    });
    // Every node in a multi-selection fires dragend; after the first, the patches are no-ops.
    useDoc.getState().updateElements(patches);
    const { format } = useDoc.getState().doc;
    useUi.getState().setActivePage(pageOf({ x: e.target.x(), width: el.width }, format.w, format.pages));
  };

  const onTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const { elements } = useDoc.getState().doc;
    const patches = groupIds().flatMap((id) => {
      const node = stage.findOne(`#${id}`);
      const target = elements.find((x) => x.id === id);
      return node && target ? [{ id, patch: transformPatch(node, target) }] : [];
    });
    useDoc.getState().updateElements(patches);
  };

  return {
    id: el.id,
    name: "element",
    draggable: !el.locked,
    onMouseDown: select,
    onTap: select,
    onDragEnd,
    onTransformEnd,
  };
}
