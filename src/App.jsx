import { useEffect, useState, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Favorites from './pages/Favorites'
import History from './pages/History'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import AgeGate from './components/AgeGate'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Watch from './pages/Watch'
import RequireAdmin from './components/RequireAdmin'
import AdminLogin from './pages/AdminLogin'
import Search from './pages/Search'
import Categories from './pages/Categories'
import Category from './pages/Category'

export default function App() {
  const [ok, setOk] = useState(false)
  const navigate = useNavigate()
  const bufferRef = useRef('')

  useEffect(() => {
    setOk(localStorage.getItem('portub_age_ok') === '1')
  }, [])

  useEffect(() => {
    if (!ok) return
    const onKey = (e) => {
      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-4)
      if (bufferRef.current === 'sapo') navigate('/sapo')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ok, navigate])

  if (!ok) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="agegate">
          <AgeGate onConfirm={() => setOk(true)} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/search" element={<Search />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/c/:id" element={<Category />} />
        <Route path="/sapo/login" element={<AdminLogin />} />
        <Route path="/minha-lista" element={<Favorites />} />
        <Route path="/historico" element={<History />} />
        <Route
          path="/sapo"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
      </Routes>
    </div>
  )
}
