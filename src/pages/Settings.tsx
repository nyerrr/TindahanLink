import { useState } from 'react'
import { motion } from 'framer-motion'
import { signOut } from '../lib/auth'
import { useProfile } from '../context/ProfileContext'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types'
import { requestNotificationPermission } from '../lib/pushNotifications'

type Props = {
  onNavigate: (page: Page) => void
  onLogout: () => void
  userEmail: string
}

export default function Settings({ onNavigate, onLogout, userEmail }: Props) {
  const [notifPermission, setNotifPermission] = useState(Notification.permission)
  const { profile, updateProfile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    store_name: profile.store_name,
    location: profile.location
  })
  const [success, setSuccess] = useState(false)

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermission()
    setNotifPermission(granted ? 'granted' : 'denied')
  }

  async function handleLogout() {
    const confirm = window.confirm('Sigurado ka bang mag-lo-logout?')
    if (!confirm) return
    setLoading(true)
    await signOut()
    onLogout()
  }

  async function handleSave() {
    if (!form.store_name.trim()) return alert('Lagyan ng pangalan ang tindahan!')
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    setEditing(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-24">

      {/* Header */}
      <div className="bg-[#0D3B2E] px-5 pt-12 pb-6">
        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">
          {profile.store_name}
        </p>
        <h1 className="text-white text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-white/40 text-xs mt-1">I-manage ang inyong account</p>
      </div>

      <div className="bg-[#0D3B2E] h-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F0F4F0] rounded-t-3xl" />
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* Success message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-100 rounded-2xl p-3"
          >
            <p className="text-green-600 text-xs font-semibold">
              ✅ Na-save ang inyong tindahan!
            </p>
          </motion.div>
        )}

        {/* Store Info Card */}
        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              Impormasyon ng Tindahan
            </p>
            <button
              onClick={() => {
                setEditing(!editing)
                setForm({ store_name: profile.store_name, location: profile.location })
              }}
              className="text-xs font-bold text-[#1B8B5A]"
            >
              {editing ? 'Kanselahin' : 'I-edit'}
            </button>
          </div>

          {editing ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                  Pangalan ng Tindahan
                </label>
                <input
                  value={form.store_name}
                  onChange={e => setForm({ ...form, store_name: e.target.value })}
                  placeholder="hal. Aling Nena's Store"
                  className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl px-4 py-3 text-sm font-medium text-[#0D3B2E] focus:outline-none focus:border-[#0D3B2E]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                  Lokasyon
                </label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="hal. Caloocan, Metro Manila"
                  className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl px-4 py-3 text-sm font-medium text-[#0D3B2E] focus:outline-none focus:border-[#0D3B2E]"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#0D3B2E] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-60"
              >
                {saving ? 'Sine-save...' : 'I-save ang Tindahan'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#0D3B2E] rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-2xl">🏪</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#0D3B2E]">{profile.store_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">📍 {profile.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Account Card */}
        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">
            Account
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0F4F0] rounded-xl flex items-center justify-center  shrink-0">
              <span className="text-lg">👤</span>
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

        {/* Notifications Card */}
        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">
            Mga Notipikasyon
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0D3B2E]">Low Stock Alerts</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Abisuhan kung mababa na ang stock
              </p>
            </div>
            {notifPermission === 'granted' ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Bukas ✅
              </span>
            ) : notifPermission === 'denied' ? (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Blocked ❌
              </span>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="text-xs font-bold text-white bg-[#0D3B2E] px-3 py-1.5 rounded-full"
              >
                I-enable
              </button>
            )}
          </div>
          {notifPermission === 'denied' && (
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              I-allow ang notifications sa inyong browser settings para matanggap ang mga alerto.
            </p>
          )}
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