import type { Locale } from "@/lib/i18n/config";
import { getAppDictionary } from "@/lib/i18n/appDictionary";
import type { Template } from "./schema";

/**
 * Template JSON is authored in Turkish; other languages override the title and the baked-in
 * texts. Ids, tags and geometry never change, so templates stay interchangeable across languages.
 */
export function localizeTemplate(t: Template, lang: Locale): Template {
  if (lang === "tr") return t;
  const { templateNames, templateTexts } = getAppDictionary(lang);
  return {
    ...t,
    title: templateNames[t.id] ?? t.title,
    elements: t.elements.map((e) => (e.type === "text" && templateTexts[e.text] ? { ...e, text: templateTexts[e.text] } : e)),
  };
}
