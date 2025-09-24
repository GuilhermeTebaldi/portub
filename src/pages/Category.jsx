import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import categoriesSeed from '../data/categories.json'
import videosSeed from '../data/videos.json'
import { ensureSeed, getCategories, getVideos, onDataChange } from '../lib/store'
import VideoCard from '../components/VideoCard'

export default function Category() {
  const { id } = useParams()
  const [cats, setCats] = useState([])
  const [vids, setVids] = useState([])

  useEffect(() => {
    ensureSeed(categoriesSeed, videosSeed)
    const sync = () => { setCats(getCategories()); setVids(getVideos()) }
    sync()
    const off = onDataChange(sync)
    return off
  }, [])

  const cat = cats.find(c => c.id === id)
  const items = useMemo(() => vids.filter(v => v.categories?.includes(id)), [vids, id])

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-semibold mb-4">{cat?.name || id}</h1>
      {!items.length && <div className="text-zinc-400 text-sm">Sem vídeos.</div>}
      <div className="flex gap-3 flex-wrap">
        {items.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}
