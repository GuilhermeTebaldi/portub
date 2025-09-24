import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import categoriesSeed from '../data/categories.json'
import videosSeed from '../data/videos.json'
import { ensureSeed, getVideos } from '../lib/store'
import VideoCard from '../components/VideoCard'

export default function Search() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()
  const [vids, setVids] = useState([])

  useEffect(() => {
    ensureSeed(categoriesSeed, videosSeed)
    setVids(getVideos())
  }, [])

  const results = useMemo(() => {
    if (!q) return []
    return vids.filter(v =>
      (v.title || '').toLowerCase().includes(q) ||
      (v.categories || []).join(' ').toLowerCase().includes(q)
    )
  }, [vids, q])

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-semibold mb-4">Resultado da busca: {q || '—'}</h1>
      {q && results.length === 0 && (
        <div className="text-zinc-400 text-sm">Nada encontrado.</div>
      )}
      <div className="flex gap-3 flex-wrap">
        {results.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}
