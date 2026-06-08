import { useState } from 'react'
import { signIn, signUp } from '../lib/auth'

// tells App.tsx when login succeeds
// so that App.tsx can switch to the Dashboard
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
    // Basic validation before hitting the API
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
        // Tell App.tsx login succeeded → switch to dashboard
        onLogin()
      }
    } catch (e: any) {
      // Supabase returns error messages we can show directly
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

  // Allow pressing Enter to submit
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-[#F0F4F0] flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-[#0D3B2E] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0D3B2E]/20">
          <span className="text-4xl">🏪</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0D3B2E] tracking-tight">TindahanLink</h1>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          Para sa mga sari-sari store sa Pilipinas
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-[#E8EDE8]">

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
          <div>
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
          </div>

          {/* Password */}
          <div>
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
          </div>

        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <p className="text-red-600 text-xs font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
            <p className="text-green-600 text-xs font-medium">✅ {success}</p>
          </div>
        )}

        {/* Remember Me */}
        {!isSignUp && (
          <div className="flex items-center gap-2 mt-2">
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
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#0D3B2E] text-white rounded-xl py-3.5 font-bold text-sm mt-4 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading
            ? 'Loading...'
            : isSignUp
            ? 'Gumawa ng Account'
            : 'Mag-login'
          }
        </button>

      </div>

      {/* Footer */}
      <p className="text--black text-xs mt-6 text-center font-medium">
        TindahanLink · Para sa mga negosyante ng Pilipinas 🇵🇭
      </p>

    </div>
  )
}