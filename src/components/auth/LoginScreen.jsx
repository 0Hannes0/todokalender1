import { useState } from 'react'
import { useAuth } from '../../store/AuthContext'

export function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(mode)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setSuccess('Bestätigungs-E-Mail gesendet! Bitte E-Mail prüfen.')
      }
    } catch (err) {
      const msg = err.message || 'Unbekannter Fehler'
      if (msg.includes('Invalid login')) setError('E-Mail oder Passwort falsch.')
      else if (msg.includes('already registered')) setError('E-Mail bereits registriert.')
      else if (msg.includes('Password should')) setError('Passwort muss mindestens 6 Zeichen haben.')
      else setError(msg)
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="20" rx="3" stroke="white" strokeWidth="2"/>
              <path d="M4 14h24" stroke="white" strokeWidth="2"/>
              <path d="M11 4v6M21 4v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="11" cy="21" r="1.5" fill="white"/>
              <circle cx="16" cy="21" r="1.5" fill="white"/>
              <circle cx="21" cy="21" r="1.5" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text">TodoKalender</h1>
          <p className="text-sm text-text-3 mt-1">Dein persönlicher Kalender</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
          {/* Mode toggle */}
          <div className="flex bg-surface-3 rounded-xl p-1 gap-0.5 mb-5">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all
                ${mode === 'login' ? 'bg-white text-accent shadow-sm' : 'text-text-3'}`}
            >
              Einloggen
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all
                ${mode === 'register' ? 'bg-white text-accent shadow-sm' : 'text-text-3'}`}
            >
              Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-text-2 mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="deine@email.de"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-4 focus:outline-none focus:border-accent-mid transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-2 mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-4 focus:outline-none focus:border-accent-mid transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
            )}

            <button
              type="submit"
              disabled={!!loading}
              className="mt-1 w-full bg-accent text-white font-medium py-2.5 rounded-xl transition-all hover:bg-accent-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '…' : mode === 'login' ? 'Einloggen' : 'Konto erstellen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
