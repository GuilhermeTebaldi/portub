import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import categoriesSeed from '../data/categories.json'
import videosSeed from '../data/videos.json'
import {
  ensureSeed, getHistory, getVideos, onDataChange,
  removeFromHistory, clearHistory,
} from '../lib/store'

export default function History() {
  const [records, setRecords] = useState([])
  const [byId, setById] = useState({})

  useEffect(() => {
    ensureSeed(categoriesSeed, videosSeed)
    const sync = () => {
      setRecords(getHistory(200))
      const vids = getVideos()
      setById(Object.fromEntries(vids.map(v => [v.id, v])))
    }
    sync()
    const off = onDataChange(sync)
    return off
  }, [])

  return (
    <div className="container-app py-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Histórico</h1>
        <button
          className="ml-auto btn bg-zinc-800 hover:bg-zinc-700"
          onClick={() => clearHistory()}
        >
          Limpar histórico
        </button>
      </div>

      {!records.length && <div className="text-zinc-400 text-sm">Sem histórico.</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {records.map(r => {
          const v = byId[r.id]
          if (!v) {
            return (
              <div key={r.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                <div className="text-sm text-zinc-400">Vídeo removido</div>
                <div className="text-xs text-zinc-500">{new Date(r.ts).toLocaleString()}</div>
                <button className="btn bg-zinc-800 hover:bg-zinc-700" onClick={() => removeFromHistory(r.id)}>Remover</button>
              </div>
            )
          }
          return (
            <div key={r.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <Link to={`/watch/${v.id}`}>
                <img src={v.thumbnail} alt={v.title} className="aspect-video w-full object-cover" />
              </Link>
              <div className="p-3 space-y-2">
                <Link to={`/watch/${v.id}`} className="font-medium line-clamp-1 hover:underline">{v.title}</Link>
                <div className="text-xs text-zinc-500">{new Date(r.ts).toLocaleString()}</div>
                <div className="flex gap-2">
                  <Link className="btn bg-zinc-800 hover:bg-zinc-700" to={`/watch/${v.id}`}>Assistir</Link>
                  <button className="btn bg-red-600 hover:bg-red-700" onClick={() => removeFromHistory(r.id)}>Remover</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
