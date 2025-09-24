import { useEffect, useState } from 'react'
import categoriesSeed from '../data/categories.json'
import videosSeed from '../data/videos.json'
import Row from '../components/Row'
import {
  ensureSeed,
  getCategories,
  getVideos,
  onDataChange,
  getHistoryVideos,
} from '../lib/store'

export default function Home() {
  const [cats, setCats] = useState([])
  const [vids, setVids] = useState([])
  const [recent, setRecent] = useState([])

  useEffect(() => {
    ensureSeed(categoriesSeed, videosSeed)
    const sync = () => {
      setCats(getCategories())
      setVids(getVideos())
      setRecent(getHistoryVideos())
    }
    sync()
    const off = onDataChange(sync)
    return off
  }, [])

  const byCat = cats.map(cat => ({
    cat,
    items: vids.filter(v => v.categories?.includes(cat.id)),
  }))

  return (
    <main>
      <div className="container-app pt-6 pb-2">
        <div className="aspect-[16/6] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-end p-6">
          <div>
            <h1 className="text-3xl font-bold">Bem-vindo ao PORTUB</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Plataforma 18+ leve, rápida e pronta para crescer.
            </p>
          </div>
        </div>
      </div>
      {recent.length > 0 && <Row title="Continuar assistindo" items={recent} />}
      {byCat.map(({ cat, items }) => (
        <Row key={cat.id} title={cat.name} items={items} catId={cat.id} />
      ))}
    </main>
  )
}
