import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../lib/auth'
import logo from '../assets/logoPORTUBE.png'
export default function AdminLogin() {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const loc = useLocation()

  function submit(e) {
    e.preventDefault()
    setErr('')
    if (login(pass)) {
      nav(loc.state?.from?.pathname || '/sapo', { replace: true })
    } else {
      setErr('Senha incorreta')
    }
  }

  return (
    <div className="container-app py-20 max-w-md mx-auto">
      <form onSubmit={submit} className="card p-6 space-y-4">
        <div className="text-center">
            <img src={logo} alt="PORTUB" className="h-10 inline-block" />
         
          
          <h1 className="text-xl font-semibold mt-2">Acesso restrito</h1>
          <p className="text-xs text-zinc-400">Digite a senha do administrador</p>
        </div>
        <input
          type="password"
          className="w-full bg-zinc-900 rounded-xl px-3 py-2"
          placeholder="Senha"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        {err && <div className="text-sm text-red-400">{err}</div>}
        <button type="submit" className="btn btn-primary w-full">Entrar</button>
      </form>
    </div>
  )
}
