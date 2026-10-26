import type { Template } from "./schema";
import gridTwoByTwo from "./data/grid-2x2.json";
import bigPlusTwo from "./data/big-plus-two.json";
import polaroidScatter from "./data/polaroid-scatter.json";
import filmstrip from "./data/filmstrip-3.json";
import panorama from "./data/panorama-3.json";
import coverMonth from "./data/cover-month.json";

export const TEMPLATES = [
  coverMonth,
  polaroidScatter,
  gridTwoByTwo,
  bigPlusTwo,
  panorama,
  filmstrip,
] as Template[];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
