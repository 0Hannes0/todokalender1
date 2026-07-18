import { AuthProvider, useAuth } from './store/AuthContext'
import { AppProvider } from './store/AppContext'
import { AppShell } from './components/layout/AppShell'
import { LoginScreen } from './components/auth/LoginScreen'

function Inner() {
  const { user } = useAuth()

  // Still checking session
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}
