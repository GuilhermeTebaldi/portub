import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import categoriesSeed from '../data/categories.json'
import videosSeed from '../data/videos.json'
import { ensureSeed, getCategories, getVideos, onDataChange } from '../lib/store'

export default function Categories() {
  const [cats, setCats] = useState([])
  const [vids, setVids] = useState([])

  useEffect(() => {
    ensureSeed(categoriesSeed, videosSeed)
    const sync = () => { setCats(getCategories()); setVids(getVideos()) }
    sync()
    const off = onDataChange(sync)
    return off
  }, [])

  const counts = useMemo(() => {
    const map = Object.fromEntries(cats.map(c => [c.id, 0]))
    vids.forEach(v => (v.categories||[]).forEach(id => { if (id in map) map[id]++ }))
    return map
  }, [cats, vids])

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-semibold mb-4">Categorias</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {cats.map(c => (
          <Link key={c.id} to={`/c/${c.id}`} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900">
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-zinc-500">{counts[c.id] || 0} vídeos</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
