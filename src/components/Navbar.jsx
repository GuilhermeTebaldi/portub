import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logoPORTUBE.png'
export default function Navbar() {
  const [q, setQ] = useState('')
  const nav = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    const query = q.trim()
    if (query) nav(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black to-black/0">
      <div className="container-app py-4 flex items-center gap-4">
        <img src={logo} alt="PORTUB" className="h-7" />
      
        
        <nav className="text-sm text-zinc-300 flex gap-4">
  <a href="/" className="hover:text-white">Início</a>
  <a href="/categorias" className="hover:text-white">Categorias</a>
  <a href="/minha-lista" className="hover:text-white">Minha lista</a>
  <a href="/historico" className="hover:text-white">Histórico</a>
</nav>
        <form onSubmit={onSubmit} className="ml-auto">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Buscar..."
            className="bg-zinc-900 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ring-zinc-700"
          />
        </form>
      </div>
    </header>
  )
}
