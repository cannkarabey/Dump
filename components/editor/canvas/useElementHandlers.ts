import type Konva from "konva";
import { pageOf, useDoc } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import type { El } from "@/lib/types";

const MIN_SIZE = 20;

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

  /** Bakes scale into width/height so crops and strokes stay crisp. */
  const bake = (node: Konva.Node) => {
    const width = Math.max(MIN_SIZE, node.width() * node.scaleX());
    const height = Math.max(MIN_SIZE, node.height() * node.scaleY());
    node.setAttrs({ width, height, scaleX: 1, scaleY: 1 });
    return { x: node.x(), y: node.y(), width, height, rotation: node.rotation() };
  };

  const onTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const patches = groupIds().flatMap((id) => {
      const node = stage.findOne(`#${id}`);
      return node ? [{ id, patch: bake(node) }] : [];
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
    bake,
  };
}
