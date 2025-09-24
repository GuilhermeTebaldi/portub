import { isAuthed } from '../lib/auth'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAdmin({ children }) {
  const loc = useLocation()
  if (!isAuthed()) return <Navigate to="/sapo/login" state={{ from: loc }} replace />
  return children
}
