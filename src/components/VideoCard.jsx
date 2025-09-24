import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isFavorite, toggleFavorite, onDataChange } from '../lib/store'

export default function VideoCard({ video, catId }) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    setFav(isFavorite(video.id))
    const off = onDataChange(() => setFav(isFavorite(video.id)))
    return off
  }, [video.id])

  const to = catId ? `/watch/${video.id}?cat=${encodeURIComponent(catId)}` : `/watch/${video.id}`

  return (
    <div className="group w-52 shrink-0 relative">
      <button
        type="button"
        aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className={`absolute z-10 right-2 top-2 text-xs rounded-lg px-2 py-1 bg-black/60 hover:bg-black/80 ${fav ? 'ring-1 ring-white' : ''}`}
        onClick={(e) => { e.preventDefault(); toggleFavorite(video.id) }}
      >
        {fav ? '★' : '☆'}
      </button>

      <Link to={to}>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 text-[11px] bg-black/70 px-2 py-0.5 rounded">
            {video.duration}
          </div>
        </div>
        <div className="mt-2 text-sm text-zinc-200 line-clamp-2">
          {video.title}
        </div>
      </Link>
    </div>
  )
}
