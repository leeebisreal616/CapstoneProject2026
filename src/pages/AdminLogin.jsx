import { useState } from 'react'
import { login } from '../utils/adminAuth'

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 500))

    const result = login(username.trim(), password)
    setSubmitting(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 overflow-hidden ring-2 ring-[#085041]/10">
            <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
          </div>
          <p className="text-[18px] font-bold text-gray-900">GCO Admin Portal</p>
          <p className="text-[13px] text-gray-500 mt-1">CvSU Imus Campus</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-[15px] font-semibold text-gray-900 mb-1">Staff Login</p>
          <p className="text-[12.5px] text-gray-500 mb-5">Sign in with your GCO staff account.</p>

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75] transition-all"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75] transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-[12.5px] mb-3 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 rounded-full text-[14.5px] font-semibold mt-3 transition-all ${submitting ? 'bg-gray-300 text-gray-500' : 'bg-[#085041] text-white'}`}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => setShowHint(!showHint)} className="text-[12px] text-gray-400 underline">
            {showHint ? 'Hide demo credentials' : 'Show demo credentials'}
          </button>
          {showHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 text-left">
              <p className="text-[11.5px] text-amber-800">Username: <strong>admin</strong></p>
              <p className="text-[11.5px] text-amber-800">Password: <strong>gco2026</strong></p>
              <p className="text-[10.5px] text-amber-600 mt-1.5">This is a prototype login only. Real staff authentication will be integrated by the university IT team.</p>
            </div>
          )}
        </div>

        <p className="text-center text-[11.5px] text-gray-400 mt-5">
          Having trouble signing in? Contact the CvSU Imus IT Office.
        </p>
      </div>
    </div>
  )
}