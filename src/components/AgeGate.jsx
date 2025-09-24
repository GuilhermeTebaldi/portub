// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import logo from '../assets/logoPORTUBE.png'
export default function AgeGate({ onConfirm }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8 text-center space-y-6"
      >
        <div className="flex justify-center">
            <img src={logo} alt="PORTUB" className="h-12" />      
        </div>
        <h1 className="text-2xl font-bold">Conteúdo 18+</h1>
        <p className="text-zinc-400 text-sm">
          Este site contém conteúdo adulto. Confirme que você tem 18 anos ou mais para continuar.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.setItem('portub_age_ok', '1')
              onConfirm()
            }}
          >
            Tenho 18+
          </button>
          <a
            href="https://www.google.com"
            className="btn bg-zinc-800 hover:bg-zinc-700"
          >
            Sair
          </a>
        </div>
      </motion.div>
    </div>
  )
}
