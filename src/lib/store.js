const K_CATS = 'portub_categories_v1'
const K_VIDS = 'portub_videos_v1'
const K_HISTORY = 'portub_history_v1'
const K_FAVS = 'portub_favorites_v1'
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event('portub-data-changed'))
}

export function ensureSeed(defaultCats = [], defaultVids = []) {
  if (!localStorage.getItem(K_CATS)) write(K_CATS, defaultCats)
  if (!localStorage.getItem(K_VIDS)) write(K_VIDS, defaultVids)
}

export function getCategories() { return read(K_CATS, []) }
export function getVideos() { return read(K_VIDS, []) }

export function upsertCategory(cat) {
  const list = getCategories()
  const idx = list.findIndex(c => c.id === cat.id)
  if (idx >= 0) list[idx] = cat
  else list.push(cat)
  write(K_CATS, list)
}
export function deleteCategory(id) {
  write(K_CATS, getCategories().filter(c => c.id !== id))
  // também remove categoria dos vídeos
  const vids = getVideos().map(v => ({ ...v, categories: (v.categories||[]).filter(c => c !== id) }))
  write(K_VIDS, vids)
}

export function upsertVideo(v) {
  const list = getVideos()
  const idx = list.findIndex(i => i.id === v.id)
  if (idx >= 0) list[idx] = v
  else list.push(v)
  write(K_VIDS, list)
}
export function deleteVideo(id) {
  write(K_VIDS, getVideos().filter(v => v.id !== id))
}

export function exportData() {
  return {
    categories: getCategories(),
    videos: getVideos(),
  }
}
export function importData(payload) {
  if (Array.isArray(payload?.categories)) write(K_CATS, payload.categories)
  if (Array.isArray(payload?.videos)) write(K_VIDS, payload.videos)
}

export function onDataChange(cb) {
  const h = () => cb()
  window.addEventListener('portub-data-changed', h)
  return () => window.removeEventListener('portub-data-changed', h)
}
export function getFavorites() {
    return read(K_FAVS, [])
  }
  export function isFavorite(id) {
    return getFavorites().includes(id)
  }
  export function toggleFavorite(id) {
    const favs = new Set(getFavorites())
    if (favs.has(id)) favs.delete(id)
    else favs.add(id)
    write(K_FAVS, Array.from(favs))
  }
  export function getFavoriteVideos() {
    const favs = new Set(getFavorites())
    return getVideos().filter(v => favs.has(v.id))
  }
  // histórico: [{ id, ts }]
export function addToHistory(id) {
    const now = Date.now()
    const list = read(K_HISTORY, [])
      .filter(e => e && e.id !== id)
      .concat([{ id, ts: now }])
      .slice(-100) // limita
    write(K_HISTORY, list)
  }
  export function getHistory(limit = 12) {
    const list = read(K_HISTORY, []).slice().sort((a,b) => b.ts - a.ts)
    return list.slice(0, limit)
  }
  export function getHistoryVideos(limit = 12) {
    const vids = getVideos()
    const ids = getHistory(limit).map(e => e.id)
    const byId = Object.fromEntries(vids.map(v => [v.id, v]))
    return ids.map(id => byId[id]).filter(Boolean)
  }
  export function clearHistory() {
    write('portub_history_v1', [])
  }
  export function removeFromHistory(id) {
    const list = read('portub_history_v1', []).filter(e => e.id !== id)
    write('portub_history_v1', list)
  }
  export async function pullFromGitHub() {
    const r = await fetch('/api/get')
    if (!r.ok) throw new Error('pull failed')
    const data = await r.json()
    if (Array.isArray(data.categories)) write(K_CATS, data.categories)
    if (Array.isArray(data.videos)) write(K_VIDS, data.videos)
  }
  export async function pushToGitHub(writeKey) {
    const r = await fetch('/api/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-write-key': writeKey || '' },
      body: JSON.stringify(exportData()),
    })
    if (!r.ok) throw new Error('push failed')
  }
  