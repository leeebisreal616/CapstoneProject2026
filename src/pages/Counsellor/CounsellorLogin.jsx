import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../../utils/counsellorAuth'

export default function CounsellorLogin({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [locked, setLocked] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLocked(false)
    setSubmitting(true)
    const result = await login(username.trim(), password)
    setSubmitting(false)
    if (result.success) {
      onSuccess()
    } else {
      setError(result.message)
      if (result.locked) setLocked(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 overflow-hidden ring-2 ring-[#085041]/10 shadow-sm">
            <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[18px] font-bold text-gray-900">Counsellor Login</h1>
          <p className="text-[13px] text-gray-500 mt-1 leading-snug">
            Guidance and Counseling Office
            <br />
            <span className="text-gray-400">CvSU Imus Campus</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4">
            <label htmlFor="counsellor-username" className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Username</label>
            <input
              id="counsellor-username"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="Username"
              autoComplete="username"
              disabled={locked}
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75] transition-all disabled:bg-gray-100"
              required
            />
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="counsellor-password" className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">Password</label>
              <Link to="/counsellor/forgot-password" className="text-[12.5px] text-[#085041] font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="counsellor-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Password"
                autoComplete="current-password"
                disabled={locked}
                className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 pr-12 text-[15px] outline-none focus:border-[#1D9E75] transition-all disabled:bg-gray-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#085041] hover:text-[#063a2e]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <p className={`text-[12.5px] mt-3 mb-1 flex items-start gap-1.5 ${locked ? 'text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5' : 'text-red-500'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </p>
          )}

          <button type="submit" disabled={submitting || locked} className={`w-full py-3.5 rounded-full text-[14.5px] font-semibold mt-4 transition-all ${submitting || locked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#085041] text-white hover:bg-[#063a2e]'}`}>
            {submitting ? 'Signing in...' : locked ? 'Account Locked — Try Again in 30 mins' : 'Sign In'}
          </button>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
            <span className="text-[12px] text-gray-500">Are you a student?</span>
            <Link to="/login" className="text-[12px] font-bold text-[#085041] hover:underline">Student Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}