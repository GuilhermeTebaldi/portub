/* eslint-env node */
import { Buffer } from 'node:buffer'

export default async function handler(req, res) {
  try {
    const token = process.env.GITHUB_TOKEN
    const [owner, repo] = (process.env.GITHUB_REPO || '').split('/')
    const branch = process.env.GITHUB_BRANCH || 'main'
    const catsPath = process.env.GITHUB_CATEGORIES_PATH || 'src/data/categories.json'
    const vidsPath = process.env.GITHUB_VIDEOS_PATH || 'src/data/videos.json'
    if (!token || !owner || !repo) { res.status(500).json({ error: 'env missing' }); return }

    async function readFile(path) {
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      })
      if (!r.ok) throw new Error(`GET ${path} ${r.status}`)
      const j = await r.json()
      const content = Buffer.from(j.content, 'base64').toString('utf8')
      return JSON.parse(content)
    }

    const [categories, videos] = await Promise.all([readFile(catsPath), readFile(vidsPath)])
    res.status(200).json({ categories, videos })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
