import type { Template } from "./schema";
import coverMonth from "./data/cover-month.json";
import polaroidScatter from "./data/polaroid-scatter.json";
import gridTwoByTwo from "./data/grid-2x2.json";
import bigPlusTwo from "./data/big-plus-two.json";
import panorama from "./data/panorama-3.json";
import filmstrip from "./data/filmstrip-3.json";
import gridThree from "./data/grid-3x3.json";
import stackThree from "./data/stack-three.json";
import scrapbook from "./data/scrapbook.json";
import chatLabels from "./data/chat-labels.json";
import weekendRecap from "./data/weekend-recap.json";
import filmDiary from "./data/film-diary.json";
import pastelPanorama from "./data/pastel-panorama.json";
import colorBlock from "./data/color-block.json";
import polaroidWall from "./data/polaroid-wall.json";
import singleHero from "./data/single-hero.json";

/** Display order in the editor panel and the gallery ("Önerilen" sort). */
export const TEMPLATES = [
  coverMonth,
  polaroidScatter,
  weekendRecap,
  chatLabels,
  gridTwoByTwo,
  bigPlusTwo,
  singleHero,
  colorBlock,
  gridThree,
  stackThree,
  panorama,
  filmstrip,
  scrapbook,
  filmDiary,
  pastelPanorama,
  polaroidWall,
] as Template[];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function photoCount(t: Template): number {
  return t.elements.filter((e) => e.type === "slot").length;
}

export function templatePages(t: Template): number {
  return t.mode === "single" ? 1 : t.pages;
}

/** Templates sharing the most tags with `t` (excluding itself). */
export function similarTemplates(t: Template, limit = 4): Template[] {
  return TEMPLATES.filter((x) => x.id !== t.id)
    .map((x) => ({ x, score: x.tags.filter((tag) => t.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ x }) => x);
}
