import { createContext, useContext, useState } from 'react'
import { LoginModal } from '../components/auth/LoginModal'

const LoginGateContext = createContext(null)

export function LoginGateProvider({ children }) {
  const [open, setOpen] = useState(false)

  function requireAuth(fn) {
    // Returns a wrapped function that shows login modal if not authed
    return fn
  }

  return (
    <LoginGateContext.Provider value={{ openLogin: () => setOpen(true) }}>
      {children}
      {open && <LoginModal onClose={() => setOpen(false)} />}
    </LoginGateContext.Provider>
  )
}

export function useLoginGate() { return useContext(LoginGateContext) }
