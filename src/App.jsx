import { AuthProvider, useAuth } from './store/AuthContext'
import { LoginGateProvider } from './store/LoginGateContext'
import { AppProvider } from './store/AppContext'
import { AppShell } from './components/layout/AppShell'

function Inner() {
  const { user } = useAuth()

  // Still checking session — show spinner
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  // Always show the app — login modal appears on demand
  return (
    <LoginGateProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </LoginGateProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}
