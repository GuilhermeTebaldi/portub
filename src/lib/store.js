// CHAVES
const K_CATS = 'portub_categories_v1'
const K_VIDS = 'portub_videos_v1'
const K_HISTORY = 'portub_history_v1'
const K_FAVS = 'portub_favorites_v1'
const K_LAST_PULL = 'portub_last_pull_v1'
const K_SOURCE = 'portub_source_v1' // 'github' | 'local'
const K_WRITE_KEY = 'portub_write_key_v1' // armazenada no admin local

// SYNC
const PULL_TTL_MS = 60 * 1000 // 1 min

// STORAGE HELPERS
function read(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event('portub-data-changed'))
}

// PUBLIC: origem e write key
export function getSource() { return read(K_SOURCE, 'local') }
function setSource(s) { write(K_SOURCE, s) }
export function setWriteKey(key) { localStorage.setItem(K_WRITE_KEY, key || '') }
export function getWriteKey() { return localStorage.getItem(K_WRITE_KEY) || '' }

// SEED + PULL ON BOOT
export function ensureSeed(defaultCats = [], defaultVids = []) {
  // só preenche seed se estiver vazio
  if (read(K_CATS, null) === null) write(K_CATS, defaultCats)
  if (read(K_VIDS, null) === null) write(K_VIDS, defaultVids)
  // tenta puxar do GitHub em background
  maybePullOnBoot().catch(() => {})
}

export async function pullFromGitHub() {
  const r = await fetch('/api/get', { cache: 'no-store' })
  if (!r.ok) throw new Error('pull failed')
  const data = await r.json()
  if (Array.isArray(data.categories)) write(K_CATS, data.categories)
  if (Array.isArray(data.videos)) write(K_VIDS, data.videos)
  write(K_LAST_PULL, Date.now())
  setSource('github')
  return true
}
export async function maybePullOnBoot(force = false) {
  const last = read(K_LAST_PULL, 0)
  if (!force && Date.now() - last < PULL_TTL_MS) return false
  try { await pullFromGitHub(); return true } catch { return false }
}
export async function pushToGitHub(writeKey) {
  const key = (writeKey || getWriteKey() || '').trim()
  if (!key) throw new Error('no write key')
  const r = await fetch('/api/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-write-key': key },
    body: JSON.stringify(exportData()),
  })
  if (!r.ok) throw new Error('push failed')
  return true
}

// debounce de push para não spammar commits
let pushTimer = null
function schedulePush() {
  const key = getWriteKey()
  if (!key) return // só o admin que salvou a chave faz push automático
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushToGitHub(key).catch(() => {})
  }, 500)
}

// CRUD CATEGORIAS/VIDEOS
export function getCategories() { return read(K_CATS, []) }
export function getVideos() { return read(K_VIDS, []) }

export function upsertCategory(cat) {
  const list = getCategories()
  const idx = list.findIndex(c => c.id === cat.id)
  if (idx >= 0) list[idx] = cat
  else list.push(cat)
  write(K_CATS, list)
  schedulePush()
}
export function deleteCategory(id) {
  write(K_CATS, getCategories().filter(c => c.id !== id))
  const vids = getVideos().map(v => ({ ...v, categories: (v.categories || []).filter(c => c !== id) }))
  write(K_VIDS, vids)
  schedulePush()
}

export function upsertVideo(v) {
  const list = getVideos()
  const idx = list.findIndex(i => i.id === v.id)
  if (idx >= 0) list[idx] = v
  else list.push(v)
  write(K_VIDS, list)
  schedulePush()
}
export function deleteVideo(id) {
  write(K_VIDS, getVideos().filter(v => v.id !== id))
  schedulePush()
}

// IMPORT/EXPORT
export function exportData() {
  return { categories: getCategories(), videos: getVideos() }
}
export function importData(payload) {
  if (Array.isArray(payload?.categories)) write(K_CATS, payload.categories)
  if (Array.isArray(payload?.videos)) write(K_VIDS, payload.videos)
  schedulePush()
}

// EVENTO GLOBAL
export function onDataChange(cb) {
  const h = () => cb()
  window.addEventListener('portub-data-changed', h)
  return () => window.removeEventListener('portub-data-changed', h)
}

// FAVORITOS
export function getFavorites() { return read(K_FAVS, []) }
export function isFavorite(id) { return getFavorites().includes(id) }
export function toggleFavorite(id) {
  const favs = new Set(getFavorites())
  if (favs.has(id)) favs.delete(id); else favs.add(id)
  write(K_FAVS, Array.from(favs))
}
export function getFavoriteVideos() {
  const favs = new Set(getFavorites())
  return getVideos().filter(v => favs.has(v.id))
}

// HISTÓRICO
export function addToHistory(id) {
  const now = Date.now()
  const list = read(K_HISTORY, [])
    .filter(e => e && e.id !== id)
    .concat([{ id, ts: now }])
    .slice(-100)
  write(K_HISTORY, list)
}
export function getHistory(limit = 12) {
  const list = read(K_HISTORY, []).slice().sort((a, b) => b.ts - a.ts)
  return list.slice(0, limit)
}
export function getHistoryVideos(limit = 12) {
  const vids = getVideos()
  const ids = getHistory(limit).map(e => e.id)
  const byId = Object.fromEntries(vids.map(v => [v.id, v]))
  return ids.map(id => byId[id]).filter(Boolean)
}
export function clearHistory() { write(K_HISTORY, []) }
export function removeFromHistory(id) {
  const list = read(K_HISTORY, []).filter(e => e.id !== id)
  write(K_HISTORY, list)
}
