import { notFound } from "next/navigation";
import { isLocale } from "./config";
import { getAppDictionary } from "./appDictionary";

/** Resolves the internal [lang] segment of an app page (validated by the layout too). */
export async function appPageLang(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { lang, t: getAppDictionary(lang) };
}
