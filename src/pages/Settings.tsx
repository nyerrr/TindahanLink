import { useState } from 'react'
import { signOut } from '../lib/auth'
import BottomNav from '../components/BottomNav'

type Page = 'dashboard' | 'inventory' | 'reports' | 'settings'

type Props = {
  onNavigate: (page: Page) => void
  onLogout: () => void
  userEmail: string
}

export default function Settings({ onNavigate, onLogout, userEmail }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    const confirm = window.confirm('Sigurado ka bang mag-lo-logout?')
    if (!confirm) return
    setLoading(true)
    await signOut()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-24">

      {/* Header */}
      <div className="bg-[#0D3B2E] px-5 pt-12 pb-6">
        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">
          Aling Nena's Store
        </p>
        <h1 className="text-white text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-white/40 text-xs mt-1">I-manage ang inyong account</p>
      </div>

      <div className="bg-[#0D3B2E] h-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F0F4F0] rounded-t-3xl" />
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* Account Card */}
        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">
            Account
          </p>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#0D3B2E] rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-2xl">👩</span>
            </div>
            <div>
              <p className="font-bold text-sm text-[#0D3B2E]">Store Owner</p>
              <p className="text-xs text-gray-400 mt-0.5">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* App Info Card */}
        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">
            App Info
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Version</span>
              <span className="text-sm text-gray-400">1.0.0</span>
            </div>
            <div className="h-px bg-[#F0F4F0]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Database</span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Connected ✅
              </span>
            </div>
            <div className="h-px bg-[#F0F4F0]" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">PWA</span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Installable ✅
              </span>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">
            Tungkol sa App
          </p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#0D3B2E] rounded-xl flex items-center justify-center">
              <span className="text-lg">🏪</span>
            </div>
            <div>
              <p className="font-bold text-sm text-[#0D3B2E]">TindahanLink</p>
              <p className="text-xs text-gray-400">Para sa mga sari-sari store sa Pilipinas</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ang TindahanLink ay isang modernong inventory at sales tracker na dinisenyo para sa mga may-ari ng sari-sari store. I-record ang benta, subaybayan ang stock, at tingnan ang ulat ng negosyo — lahat sa isang app.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full bg-red-50 border border-red-100 text-red-600 rounded-2xl py-4 font-bold text-sm active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? 'Naglo-logout...' : '🚪 Mag-logout'}
        </button>

      </div>

      <BottomNav current="settings" onNavigate={onNavigate} />
    </div>
  )
}