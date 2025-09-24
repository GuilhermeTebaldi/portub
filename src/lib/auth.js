const KEY = 'portub_admin_auth'

// normaliza: remove espaços; se vazio, usa 'sapo'
const envPass = (import.meta.env.VITE_PORTUB_ADMIN_PASS ?? '').trim()
const EXPECTED = envPass || 'sapo'

export function isAuthed() {
  return localStorage.getItem(KEY) === '1'
}

export function login(pass) {
  if ((pass ?? '').trim() === EXPECTED) {
    localStorage.setItem(KEY, '1')
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem(KEY)
}
