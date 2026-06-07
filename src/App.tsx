import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'

type Page = 'dashboard' | 'inventory' | 'reports'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  return (
    <div>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'inventory' && <Inventory onNavigate={setPage} />}
      {page === 'reports' &&  <Reports onNavigate={setPage} />}
    </div>
  )
}