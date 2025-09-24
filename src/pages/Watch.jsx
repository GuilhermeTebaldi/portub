import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import categoriesSeed from '../data/categories.json'
import videosSeed from '../data/videos.json'
import { ensureSeed, getVideos, addToHistory, getCategories } from '../lib/store'
import Row from '../components/Row'

function toEmbed(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
      if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`
    }
    if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') {
      const id = u.searchParams.get('v') || u.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    return url
  } catch { return url }
}

export default function Watch() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [video, setVideo] = useState(null)
  const [vids, setVids] = useState([])
  const [cats, setCats] = useState([])

  useEffect(() => {
    ensureSeed(categoriesSeed, videosSeed)
    setVids(getVideos())
    setCats(getCategories())
    const v = getVideos().find(x => x.id === id)
    setVideo(v || null)
    if (v) addToHistory(v.id)
  }, [id])

  const userCat = params.get('cat') || ''
  const currentCatId = useMemo(() => {
    if (userCat) return userCat
    return video?.categories?.[0] || ''
  }, [userCat, video])

  const catObj = cats.find(c => c.id === currentCatId)

  const recommended = useMemo(() => {
    if (!vids.length || !video) return []
    const inCat = currentCatId
      ? vids.filter(v => v.id !== video.id && (v.categories || []).includes(currentCatId))
      : []
    const pool = vids.filter(v => v.id !== video.id && !inCat.includes(v))
    // embaralhar simples
    const shuffled = (arr) => arr.slice().sort(() => Math.random() - 0.5)
    const target = 12
    const pick = shuffled(inCat)
    if (pick.length < target) {
      const need = target - pick.length
      pick.push(...shuffled(pool).slice(0, need))
    }
    return pick
  }, [vids, video, currentCatId])

  const embed = useMemo(() => toEmbed(video?.src), [video])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') nav(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav])

  if (!video) {
    return (
      <div className="container-app py-10">
        <button onClick={() => nav(-1)} className="btn bg-zinc-800 hover:bg-zinc-700 mb-4">Voltar</button>
        <div className="text-zinc-400">Vídeo não encontrado.</div>
      </div>
    )
  }

  return (
    <div className="container-app py-6">
      <button onClick={() => nav(-1)} className="btn bg-zinc-800 hover:bg-zinc-700">Voltar</button>
      <h1 className="text-xl font-semibold mt-4 mb-4">{video.title}</h1>

      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
        <iframe
          src={embed}
          title={video.title}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-8">
        <Row
          title={`Mais em ${catObj?.name || 'recomendados'}`}
          items={recommended}
          catId={currentCatId || undefined}
        />
      </div>
    </div>
  )
}
