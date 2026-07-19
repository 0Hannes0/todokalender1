import { AuthProvider, useAuth } from './store/AuthContext'
import { LoginGateProvider } from './store/LoginGateContext'
import { AppProvider } from './store/AppContext'
import { ThemeProvider } from './store/ThemeContext'
import { AppShell } from './components/layout/AppShell'

function Inner() {
  const { user } = useAuth()

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

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
    <ThemeProvider>
      <AuthProvider>
        <Inner />
      </AuthProvider>
    </ThemeProvider>
  )
}
