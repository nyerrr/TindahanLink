import { useState, useEffect } from 'react'
import { getSession } from './lib/auth'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import type { Page } from './types'
import { ProfileProvider } from './context/ProfileContext'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [session, setSession] = useState<any>(null)

  // true = still checking if user is logged in
  // false = we know for sure (logged in or not)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // On app startup, check if there's a saved session
    // This is why the user stays logged in even after refresh
    getSession().then(s => {
      setSession(s)
      setUserEmail(s?.user?.email || '')
      setLoading(false)
    })

    // This listener fires whenever auth state changes
    // e.g. login, logout, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        setUserEmail(s?.user?.email || '')
      }
    )

    // Cleanup: unsubscribe when App unmounts
    // Prevents memory leaks
    return () => subscription.unsubscribe()
  }, [])

  // Show loading screen while checking session
  // Without this, app would flash the login page
  // even for users who are already logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-3">🏪</p>
          <p className="text-[#0D3B2E]/40 text-sm font-medium">Naglo-load...</p>
        </div>
      </div>
    )
  }

  // No session = not logged in = show Login page
  if (!session) {
    return <Login onLogin={() => setPage('dashboard')} />
  }

 // ProfileProvider wraps everything so all pages
  // can access store name without prop drilling
  return (
    <ProfileProvider>
      <div>
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'inventory' && <Inventory onNavigate={setPage} />}
        {page === 'reports' && <Reports onNavigate={setPage} />}
        {page === 'settings' && (
          <Settings
            onNavigate={setPage}
            onLogout={() => setPage('dashboard')}
            userEmail={userEmail}
          />
        )}
      </div>
    </ProfileProvider>
  )
}