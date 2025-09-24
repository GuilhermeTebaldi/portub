/* eslint-env node */
import { Buffer } from 'node:buffer'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') { res.status(405).end(); return }
    const writeKey = req.headers['x-write-key']
    if (!writeKey || writeKey !== process.env.ADMIN_WRITE_KEY) {
      res.status(401).json({ error: 'unauthorized' }); return
    }

    const token = process.env.GITHUB_TOKEN
    const [owner, repo] = (process.env.GITHUB_REPO || '').split('/')
    const branch = process.env.GITHUB_BRANCH || 'main'
    const catsPath = process.env.GITHUB_CATEGORIES_PATH || 'src/data/categories.json'
    const vidsPath = process.env.GITHUB_VIDEOS_PATH || 'src/data/videos.json'
    if (!token || !owner || !repo) { res.status(500).json({ error: 'env missing' }); return }

    const { categories = [], videos = [] } = req.body || {}

    async function getSha(path) {
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      })
      if (!r.ok) return null
      const j = await r.json()
      return j.sha
    }
    async function putFile(path, json, message) {
      const sha = await getSha(path)
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
        body: JSON.stringify({
          message,
          content: Buffer.from(JSON.stringify(json, null, 2), 'utf8').toString('base64'),
          sha: sha || undefined,
          branch,
          committer: { name: 'PORTUB Bot', email: 'bot@portub.local' },
        }),
      })
      if (!r.ok) throw new Error(`PUT ${path} ${r.status}`)
      return r.json()
    }

    await putFile(catsPath, categories, 'chore(portub): update categories.json')
    await putFile(vidsPath, videos, 'chore(portub): update videos.json')
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
