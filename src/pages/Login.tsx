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
    <div className="min-h-screen bg-[#F0F4F0] flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* Logo — drops down from top */}
      {/* 
        initial: starts 40px above, invisible
        animate: moves to normal position, fully visible
        transition: spring physics — feels bouncy and natural
        Why spring? Because ease-in-out feels mechanical.
        Spring feels alive, like a real object with weight.
      */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
        className="mb-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
          className="w-20 h-20 bg-[#0D3B2E] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0D3B2E]/20"
        >
          <span className="text-4xl">🏪</span>
        </motion.div>
        <h1 className="text-2xl font-bold text-[#0D3B2E] tracking-tight">TindahanLink</h1>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          Para sa mga sari-sari store sa Pilipinas
        </p>
      </motion.div>

      {/* Form Card — bubbles up from bottom */}
      {/*
        Why y: 80? It starts 80px below its final position.
        Why delay: 0.15? So the logo animates first, THEN the card.
        This is called "staggered animation" — elements animate
        one after another, creating a sense of hierarchy.
        Why damping: 20? Lower damping = more bounce.
        Higher damping = less bounce, more smooth.
      */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.15 }}
        className="w-full bg-white rounded-3xl p-6 shadow-sm border border-[#E8EDE8]"
      >

        {/* Toggle tabs */}
        <div className="flex bg-[#F0F4F0] rounded-2xl p-1 mb-5">
          <button
            onClick={() => { setIsSignUp(false); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              !isSignUp
                ? 'bg-white text-[#0D3B2E] shadow-sm'
                : 'text-gray-400'
            }`}
          >
            Mag-login
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              isSignUp
                ? 'bg-white text-[#0D3B2E] shadow-sm'
                : 'text-gray-400'
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
            transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
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
          {/*
            Why delay: 0.3? Each input animates slightly after the previous.
            Why x: -20? Slides in from the left — feels like content
            is arriving from offscreen, not just appearing.
          */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
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
              <p className="text-[10px] text-gray-300 mt-1 ml-1">
                Minimum 6 characters
              </p>
            )}
          </motion.div>

        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
          >
            <p className="text-red-600 text-xs font-medium">⚠️ {error}</p>
          </motion.div>
        )}

        {/* Success message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
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
            transition={{ delay: 0.35 }}
            className="flex items-center gap-2 mt-3"
          >
            <button
              onClick={() => setRemember(!remember)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                remember
                  ? 'bg-[#0D3B2E] border-[#0D3B2E]'
                  : 'bg-white border-gray-200'
              }`}
            >
              {remember && (
                <span className="text-white text-[10px] font-bold">✓</span>
              )}
            </button>
            <span className="text-xs text-gray-400 font-medium">
              Tandaan ako sa device na ito
            </span>
          </motion.div>
        )}

        {/* Submit button */}
        {/*
          whileTap: when Aling Nena presses the button,
          it scales down to 95% — feels like a real physical button press.
          This is called a "press feedback" animation.
          Why 0.95? Subtle enough to feel real, not cartoon-like.
        */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#0D3B2E] text-white rounded-xl py-3.5 font-bold text-sm mt-4 disabled:opacity-60"
        >
          {loading
            ? 'Loading...'
            : isSignUp
            ? 'Gumawa ng Account'
            : 'Mag-login'
          }
        </motion.button>

      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-900 text-xs mt-6 text-center font-medium"
      >
        TindahanLink · Para sa mga negosyante ng Pilipinas 🇵🇭
      </motion.p>

    </div>
  )
}