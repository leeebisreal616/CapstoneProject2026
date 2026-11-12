import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../../utils/adminAuth'

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
              disabled={locked}
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75] transition-all disabled:bg-gray-100"
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
              disabled={locked}
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75] transition-all disabled:bg-gray-100"
              required
            />
          </div>

          <div className="flex justify-end mb-2">
            <Link to="/admin/forgot-password" className="text-[12.5px] text-[#085041] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className={`text-[12.5px] mb-3 flex items-start gap-1.5 ${locked ? 'text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5' : 'text-red-500'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {/* FIX: Tinanggal ko yung pangalawang "A security alert was sent..." Nasa backend message na yan, kaya isa na lang lalabas ngayon */}
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || locked}
            className={`w-full py-3.5 rounded-full text-[14.5px] font-semibold mt-3 transition-all ${submitting || locked ? 'bg-gray-300 text-gray-500' : 'bg-[#085041] text-white'}`}
          >
            {submitting ? 'Signing in...' : locked ? 'Account Locked' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[11.5px] text-gray-400 mt-5">
          Having trouble signing in? Contact the CvSU Imus IT Office.
        </p>
      </div>
    </div>
  )
}