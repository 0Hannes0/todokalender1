import { useState } from 'react'
import { useAuth } from '../../store/AuthContext'

export function LoginModal({ onClose }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        onClose()
      } else {
        await signUp(email, password)
        setSuccess('Bestätigungs-E-Mail gesendet! Bitte E-Mail prüfen.')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Invalid login')) setError('E-Mail oder Passwort falsch.')
      else if (msg.includes('already registered')) setError('E-Mail bereits registriert.')
      else if (msg.includes('Password should')) setError('Passwort muss mindestens 6 Zeichen haben.')
      else setError(msg || 'Fehler beim Einloggen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:w-auto sm:min-w-[380px] sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl animate-sheet-up sm:animate-slide-up p-6">

        {/* Drag handle mobile */}
        <div className="flex sm:hidden justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-border-2" />
        </div>

        <h2 className="text-base font-semibold text-text mb-4">Konto erforderlich</h2>
        <p className="text-xs text-text-3 mb-4">Melde dich an, um deine Daten auf allen Geräten zu speichern.</p>

        {/* Mode toggle */}
        <div className="flex bg-surface-3 rounded-xl p-1 gap-0.5 mb-4">
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all
                ${mode === m ? 'bg-white text-accent shadow-sm' : 'text-text-3'}`}>
              {m === 'login' ? 'Einloggen' : 'Registrieren'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required autoComplete="email" placeholder="E-Mail"
            className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-4 focus:outline-none focus:border-accent-mid transition-colors" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Passwort" minLength={6}
            className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-4 focus:outline-none focus:border-accent-mid transition-colors" />

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white font-medium py-2.5 rounded-xl transition-all hover:bg-accent-2 active:scale-[0.98] disabled:opacity-60">
            {loading ? '…' : mode === 'login' ? 'Einloggen' : 'Konto erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
