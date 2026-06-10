import { useState } from 'react'
import { motion } from 'framer-motion'
import { signIn, signUp } from '../lib/auth'

type Props = {
  onLogin: () => void
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [remember, setRemember] = useState(true)

  async function handleSubmit() {
    if (!email.trim()) return setError('Lagyan ng email!')
    if (!password.trim()) return setError('Lagyan ng password!')
    if (password.length < 6) return setError('Password ay dapat 6 characters man lang!')

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        await signUp(email, password)
        setSuccess('Account nagawa na! Mag-login na.')
        setIsSignUp(false)
      } else {
        await signIn(email, password, remember)
        onLogin()
      }
    } catch (e: any) {
      if (e.message.includes('Invalid login')) {
        setError('Mali ang email o password. Subukan ulit.')
      } else if (e.message.includes('already registered')) {
        setError('May account na ang email na ito. Mag-login na lang.')
      } else {
        setError(e.message || 'May error. Subukan ulit.')
      }
    }

    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-[#F0F4F0] flex md:flex-row flex-col">

      {/* ─── LEFT PANEL — desktop only ─── */}
      {/*
        Why hidden md:flex?
        On mobile → hidden (we don't show it)
        On desktop → flex (shows the branding panel)
        This is responsive design using Tailwind breakpoints
      */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="hidden md:flex md:w-1/2 bg-[#0D3B2E] flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Background decorative circles */}
        {/*
          Why decorative circles?
          Pure green background feels flat and corporate.
          Subtle geometric shapes add depth and personality
          without distracting from the content.
        */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-12 w-32 h-32 bg-[#1B8B5A]/30 rounded-full" />

        {/* Top — Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              <span className="text-xl">🏪</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TindahanLink</span>
          </div>
          <p className="text-white/40 text-sm">Para sa mga sari-sari store sa Pilipinas 🇵🇭</p>
        </div>

        {/* Middle — Main headline */}
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold tracking-tight leading-tight mb-4">
            I-digitalize ang inyong tindahan
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Ang modernong paraan para pamahalaan ang inyong sari-sari store - benta, imbentaryo, utang, at forecast sa isang lugar.
          </p>

          {/* Feature list */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: '📦', text: 'Real-time inventory tracking' },
              { icon: '📝', text: 'Digital utang notebook' },
              { icon: '🌧️', text: 'Weather-based restock alerts' },
              { icon: '📊', text: 'Sales reports at charts' },
              { icon: '📲', text: 'Installable sa phone (PWA)' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-sm shrink-0">
                  {feature.icon}
                </div>
                <span className="text-white/70 text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom — Stats */}
        <div className="relative z-10 flex gap-6">
          <div>
            <p className="text-white text-2xl font-bold">Free</p>
            <p className="text-white/40 text-xs mt-0.5">Libre gamitin</p>
          </div>
        </div>

      </motion.div>

      {/* ─── RIGHT PANEL — login form ─── */}
      {/*
        Why md:w-1/2?
        On mobile → full width (w-full is default)
        On desktop → half width, right side
        The left panel takes the other half
      */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-16 lg:px-24">

        {/* Mobile only logo — hidden on desktop since left panel shows it */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="md:hidden mb-8 text-center"
        >
          <div className="w-16 h-16 bg-[#0D3B2E] rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#0D3B2E]/20">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-xl font-bold text-[#0D3B2E] tracking-tight">TindahanLink</h1>
          <p className="text-gray-400 text-xs mt-1">Para sa mga sari-sari store sa Pilipinas</p>
        </motion.div>

        {/* Form container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Desktop greeting */}
          <div className="hidden md:block mb-8">
            <h2 className="text-center text-3xl font-bold text-[#0D3B2E] tracking-tight">
              {isSignUp ? 'Gumawa ng account' : 'Maligayang pagbabalik!'}
            </h2>
            <p className="text-center text-gray-400 text-sm mt-2">
              {isSignUp
                ? 'Libre ang paggamit. Walang credit card na kailangan.'
                : 'I-login ang inyong account para magsimula.'
              }
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8EDE8]">

            {/* Toggle tabs */}
            <div className="flex bg-[#F0F4F0] rounded-2xl p-1 mb-5">
              <button
                onClick={() => { setIsSignUp(false); setError(''); setSuccess('') }}
                className={`cursor-pointer flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  !isSignUp ? 'bg-white text-[#0D3B2E] shadow-sm' : 'text-gray-400'
                }`}
              >
                Mag-login
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError(''); setSuccess('') }}
                className={`cursor-pointer flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  isSignUp ? 'bg-white text-[#0D3B2E] shadow-sm' : 'text-gray-400'
                }`}
              >
                Mag-sign up
              </button>
            </div>

            <div className="flex flex-col gap-3">

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              >
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="alingnena@gmail.com"
                  className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl px-4 py-3 text-sm font-medium text-[#0D3B2E] placeholder:text-gray-300 focus:outline-none focus:border-[#0D3B2E] transition-colors"
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
              >
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl px-4 py-3 text-sm font-medium text-[#0D3B2E] placeholder:text-gray-300 focus:outline-none focus:border-[#0D3B2E] transition-colors"
                />
                {isSignUp && (
                  <p className="text-[10px] text-gray-600 mt-1 ml-1">Minimum 6 characters</p>
                )}
              </motion.div>

            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
              >
                <p className="text-red-600 text-xs font-medium">⚠️ {error}</p>
              </motion.div>
            )}

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2"
              >
                <p className="text-green-600 text-xs font-medium">✅ {success}</p>
              </motion.div>
            )}

            {/* Remember Me */}
            {!isSignUp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mt-3"
              >
                <button
                  onClick={() => setRemember(!remember)}
                  className={`cursor-pointer w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    remember ? 'bg-[#0D3B2E] border-[#0D3B2E]' : 'bg-white border-gray-200'
                  }`}
                >
                  {remember && <span className="text-white text-[10px] font-bold">✓</span>}
                </button>
                <span className="text-xs text-gray-400 font-medium">
                  Tandaan ako sa device na ito
                </span>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading}
              className="cursor-pointer w-full bg-[#0D3B2E] text-white rounded-xl py-3.5 font-bold text-sm mt-4 disabled:opacity-60 hover:bg-[#1B8B5A] transition-colors"
            >
              {loading
                ? 'Loading...'
                : isSignUp
                ? 'Gumawa ng Account'
                : 'Mag-login'
              }
            </motion.button>

          </div>

          {/* Footer */}
          <p className="text-black text-xs mt-5 text-center font-medium">
            TindahanLink · Para sa mga negosyante ng Pilipinas 🇵🇭
          </p>

        </motion.div>
      </div>

    </div>
  )
}