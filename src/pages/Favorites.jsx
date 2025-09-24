import { useEffect, useState } from 'react'
import categoriesSeed from '../data/categories.json'
import videosSeed from '../data/videos.json'
import { ensureSeed, getFavoriteVideos, onDataChange } from '../lib/store'
import VideoCard from '../components/VideoCard'

export default function Favorites() {
  const [items, setItems] = useState([])

  useEffect(() => {
    ensureSeed(categoriesSeed, videosSeed)
    const sync = () => setItems(getFavoriteVideos())
    sync()
    const off = onDataChange(sync)
    return off
  }, [])

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-semibold mb-4">Minha Lista</h1>
      {!items.length && <div className="text-zinc-400 text-sm">Nenhum favorito.</div>}
      <div className="flex gap-3 flex-wrap">
        {items.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}
