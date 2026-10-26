import { createStore, del, delMany, get, getMany, keys, set, setMany } from "idb-keyval";
import { assetFromStored } from "./image";
import type { Asset, DumpDoc } from "./types";

/**
 * Local persistence in IndexedDB (S2.4). Layout:
 *   dump:<id>   → DumpRecord (doc + which assets belong to it + thumbnail)
 *   asset:<id>  → AssetMeta
 *   blob:<id>   → Blob (downscaled image)
 * Assets are shared by id, so duplicating a dump doesn't copy image data.
 */
const store = typeof indexedDB === "undefined" ? undefined : createStore("dump-creator", "kv");

type AssetMeta = Omit<Asset, "url" | "img" | "blob">;

export interface DumpRecord {
  doc: DumpDoc;
  assetIds: string[];
  /** JPEG data URL of page 1. */
  thumb: string | null;
  savedAt: number;
}

export type DumpSummary = Pick<DumpRecord, "thumb" | "savedAt"> & {
  id: string;
  title: string;
  pages: number;
  photos: number;
};

const dumpKey = (id: string) => `dump:${id}`;

export async function saveDump(doc: DumpDoc, assets: Asset[], thumb: string | null) {
  const known = new Set(await getMany<AssetMeta>(assets.map((a) => `asset:${a.id}`), store).then((r) => r.flatMap((m) => (m ? [m.id] : []))));
  const fresh = assets.filter((a) => !known.has(a.id));
  if (fresh.length) {
    await setMany(
      fresh.flatMap((a): [string, unknown][] => {
        const meta: AssetMeta = { id: a.id, w: a.w, h: a.h, takenAt: a.takenAt, dominant: a.dominant, fileName: a.fileName };
        return [
          [`asset:${a.id}`, meta],
          [`blob:${a.id}`, a.blob],
        ];
      }),
      store,
    );
  }
  // savedAt follows the last edit, so merely opening a dump doesn't reorder the dashboard.
  const record: DumpRecord = { doc, assetIds: assets.map((a) => a.id), thumb, savedAt: doc.updatedAt };
  await set(dumpKey(doc.id), record, store);
}

export async function loadDump(id: string): Promise<{ doc: DumpDoc; assets: Asset[] } | null> {
  const record = await get<DumpRecord>(dumpKey(id), store);
  if (!record) return null;
  const metas = await getMany<AssetMeta>(record.assetIds.map((a) => `asset:${a}`), store);
  const blobs = await getMany<Blob>(record.assetIds.map((a) => `blob:${a}`), store);
  const assets = await Promise.all(
    metas.map((m, i) => (m && blobs[i] ? assetFromStored(m, blobs[i]!) : null)),
  );
  return { doc: record.doc, assets: assets.filter((a): a is Asset => a !== null) };
}

export async function listDumps(): Promise<DumpSummary[]> {
  const ids = (await keys<string>(store)).filter((k) => k.startsWith("dump:"));
  const records = await getMany<DumpRecord>(ids, store);
  return records
    .flatMap((r) =>
      r
        ? [
            {
              id: r.doc.id,
              title: r.doc.title,
              pages: r.doc.format.pages,
              photos: r.assetIds.length,
              thumb: r.thumb,
              savedAt: r.savedAt,
            },
          ]
        : [],
    )
    .sort((a, b) => b.savedAt - a.savedAt);
}

/** Deletes a dump and any image data no other dump still uses. */
export async function deleteDump(id: string) {
  const record = await get<DumpRecord>(dumpKey(id), store);
  await del(dumpKey(id), store);
  if (!record) return;
  const others = await getMany<DumpRecord>(
    (await keys<string>(store)).filter((k) => k.startsWith("dump:")),
    store,
  );
  const stillUsed = new Set(others.flatMap((r) => r?.assetIds ?? []));
  const orphans = record.assetIds.filter((a) => !stillUsed.has(a));
  await delMany(orphans.flatMap((a) => [`asset:${a}`, `blob:${a}`]), store);
}

export async function duplicateDump(id: string, newId: string): Promise<boolean> {
  const record = await get<DumpRecord>(dumpKey(id), store);
  if (!record) return false;
  const doc = { ...record.doc, id: newId, title: `${record.doc.title} (kopya)`, updatedAt: Date.now() };
  await set(dumpKey(newId), { ...record, doc, savedAt: Date.now() }, store);
  return true;
}
