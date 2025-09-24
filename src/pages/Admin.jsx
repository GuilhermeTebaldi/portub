import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../lib/auth'
import {
  getCategories, getVideos,
  upsertCategory, deleteCategory,
  upsertVideo, deleteVideo,
  importData, exportData,
  onDataChange, pullFromGitHub, pushToGitHub,
} from '../lib/store'

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs text-zinc-400 mb-1">{label}</div>
      {children}
    </label>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('videos')
  const [cats, setCats] = useState([])
  const [vids, setVids] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    const sync = () => { setCats(getCategories()); setVids(getVideos()) }
    sync()
    const off = onDataChange(sync)
    return off
  }, [])

  return (
    <div className="container-app py-8 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Admin • PORTUB</h1>
        <div className="ml-auto flex gap-2">
          <button
            className="btn bg-zinc-800 hover:bg-zinc-700"
            onClick={() => { logout(); nav('/'); }}
          >
            Sair
          </button>

          <button
            className="btn bg-zinc-800 hover:bg-zinc-700"
            onClick={async () => { try { await pullFromGitHub() } catch { alert('Falha ao carregar do GitHub') } }}
          >
            Carregar do GitHub
          </button>
          <button
            className="btn bg-zinc-800 hover:bg-zinc-700"
            onClick={async () => {
              const key = prompt('Chave de escrita (ADMIN_WRITE_KEY)')
              if (!key) return
              try { await pushToGitHub(key) } catch { alert('Falha ao salvar no GitHub') }
            }}
          >
            Salvar no GitHub
          </button>

          <button
            className="btn bg-zinc-800 hover:bg-zinc-700"
            onClick={() => {
              const data = exportData()
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'portub-export.json'; a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Exportar JSON
          </button>
          <label className="btn bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
            Importar JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const text = await file.text()
                try { importData(JSON.parse(text)) } catch (e) { console.warn('Import JSON inválido', e) }
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className={`btn ${tab === 'videos' ? 'btn-primary' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          onClick={() => setTab('videos')}
        >
          Vídeos
        </button>
        <button
          className={`btn ${tab === 'categorias' ? 'btn-primary' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          onClick={() => setTab('categorias')}
        >
          Categorias
        </button>
      </div>

      {tab === 'categorias' ? (
        <Categories cats={cats} vids={vids} />
      ) : (
        <Videos cats={cats} vids={vids} />
      )}
    </div>
  )
}

function Categories({ cats, vids }) {
  const [form, setForm] = useState({ id: '', name: '' })
  const usedCount = useMemo(() => {
    const map = Object.fromEntries(cats.map(c => [c.id, 0]))
    vids.forEach(v => (v.categories || []).forEach(id => { if (id in map) map[id]++ }))
    return map
  }, [cats, vids])

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Nova/Editar Categoria</h2>
        <Field label="ID (slug único)">
          <input
            className="w-full bg-zinc-900 rounded-xl px-3 py-2"
            value={form.id}
            onChange={e => setForm(f => ({ ...f, id: e.target.value.trim() }))}
            placeholder="ex: trending"
          />
        </Field>
        <Field label="Nome visível">
          <input
            className="w-full bg-zinc-900 rounded-xl px-3 py-2"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Em alta"
          />
        </Field>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!form.id || !form.name) return
              upsertCategory({ id: form.id, name: form.name })
              setForm({ id: '', name: '' })
            }}
          >
            Salvar
          </button>
          <button
            className="btn bg-zinc-800 hover:bg-zinc-700"
            onClick={() => setForm({ id: '', name: '' })}
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="md:col-span-2 card p-4">
        <h2 className="font-semibold mb-3">Categorias</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cats.map(c => (
            <div key={c.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-zinc-500">({c.id})</div>
                <div className="ml-auto text-xs text-zinc-500">{usedCount[c.id] || 0} vídeos</div>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="btn bg-zinc-800 hover:bg-zinc-700" onClick={() => setForm(c)}>Editar</button>
                <button className="btn bg-red-600 hover:bg-red-700" onClick={() => deleteCategory(c.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Videos({ cats, vids }) {
  const [form, setForm] = useState({
    id: '', title: '', thumbnail: '', src: '', duration: '', categories: [],
  })

  function toggleCat(id) {
    setForm(f => {
      const has = f.categories.includes(id)
      return { ...f, categories: has ? f.categories.filter(x => x !== id) : [...f.categories, id] }
    })
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Novo/Editar Vídeo</h2>
        <Field label="ID (deixe vazio para gerar)">
          <input
            className="w-full bg-zinc-900 rounded-xl px-3 py-2"
            value={form.id}
            onChange={e => setForm(f => ({ ...f, id: e.target.value.trim() }))}
            placeholder="ex: v123"
          />
        </Field>
        <Field label="Título">
          <input
            className="w-full bg-zinc-900 rounded-xl px-3 py-2"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Título do vídeo"
          />
        </Field>
        <Field label="Thumbnail URL">
          <input
            className="w-full bg-zinc-900 rounded-xl px-3 py-2"
            value={form.thumbnail}
            onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
            placeholder="https://..."
          />
        </Field>
        <Field label="Fonte (Vimeo/Bunny/externo)">
          <input
            className="w-full bg-zinc-900 rounded-xl px-3 py-2"
            value={form.src}
            onChange={e => setForm(f => ({ ...f, src: e.target.value }))}
            placeholder="https://vimeo.com/... ou https://..."
          />
        </Field>
        <Field label="Duração (mm:ss)">
          <input
            className="w-full bg-zinc-900 rounded-xl px-3 py-2"
            value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            placeholder="03:25"
          />
        </Field>
        <Field label="Categorias">
          <div className="flex flex-wrap gap-2">
            {cats.map(c => (
              <button
                key={c.id}
                type="button"
                className={`btn ${form.categories.includes(c.id) ? 'btn-primary' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                onClick={() => toggleCat(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              const id = form.id || uid('v')
              if (!form.title || !form.thumbnail || !form.src) return
              upsertVideo({ ...form, id })
              setForm({ id: '', title: '', thumbnail: '', src: '', duration: '', categories: [] })
            }}
          >
            Salvar
          </button>
          <button
            className="btn bg-zinc-800 hover:bg-zinc-700"
            onClick={() => setForm({ id: '', title: '', thumbnail: '', src: '', duration: '', categories: [] })}
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 card p-4">
        <h2 className="font-semibold mb-3">Vídeos</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {vids.map(v => (
            <div key={v.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <img src={v.thumbnail} alt={v.title} className="aspect-video object-cover w-full" />
              <div className="p-3 space-y-2">
                <div className="font-medium line-clamp-1">{v.title}</div>
                <div className="text-xs text-zinc-500">{v.duration || '—'}</div>
                <div className="flex gap-1 flex-wrap">
                  {(v.categories || []).map(cid => {
                    const c = cats.find(x => x.id === cid)
                    return <span key={cid} className="text-[11px] bg-zinc-800 px-2 py-0.5 rounded">{c?.name || cid}</span>
                  })}
                </div>
                <div className="flex gap-2">
                  <button className="btn bg-zinc-800 hover:bg-zinc-700" onClick={() => setForm(v)}>Editar</button>
                  <button className="btn bg-red-600 hover:bg-red-700" onClick={() => deleteVideo(v.id)}>Excluir</button>
                  <Link className="btn bg-zinc-800 hover:bg-zinc-700" to={`/watch/${v.id}`}>Abrir</Link>
                </div>
              </div>
            </div>
          ))}
          {!vids.length && <div className="text-zinc-400 text-sm">Nenhum vídeo.</div>}
        </div>
      </div>
    </div>
  )
}
