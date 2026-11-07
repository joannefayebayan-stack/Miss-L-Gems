// Miss L Gems · saved code-change dates
// The dates Faye types on /teacher-codes are saved in the site's private
// Vercel Blob store (miss-l-gems-settings) as one small file.
import { get, put } from '@vercel/blob';

const PATH = 'access/code-changes.json';
const CACHE_MS = 30 * 1000;
let cache = null, cachedAt = 0;

async function realLoad() {
  try {
    const r = await get(PATH, { access: 'private', useCache: false });
    if (!r || r.statusCode !== 200) return {};
    const data = JSON.parse(await new Response(r.stream).text());
    return data && typeof data.games === 'object' ? data.games : {};
  } catch (e) {
    if (e && e.name === 'BlobNotFoundError') return {};
    throw e;
  }
}
async function realSave(games) {
  await put(PATH, JSON.stringify({ games, savedAt: new Date().toISOString() }), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
  });
}

// Tests can swap in a fake store.
function backend() { return globalThis.__MLG_STORE || { load: realLoad, save: realSave }; }

export async function loadSaved(now = Date.now()) {
  if (cache && now - cachedAt < CACHE_MS) return cache;
  cache = await backend().load();
  cachedAt = now;
  return cache;
}
export async function saveSaved(games) {
  await backend().save(games);
  cache = games; cachedAt = Date.now();
}
export function resetCache() { cache = null; cachedAt = 0; }
