import VideoCard from './VideoCard'

export default function Row({ title, items = [], catId }) {
  if (!items.length) return null
  return (
    <section className="container-app my-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {items.map((v) => <VideoCard key={v.id} video={v} catId={catId} />)}
      </div>
    </section>
  )
}
