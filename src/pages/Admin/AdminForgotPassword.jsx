import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../utils/adminAuth'

export default function AdminForgotPassword() {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)
    const result = await requestPasswordReset(username.trim())
    setSubmitting(false)
    setMessage(result.message)
    if (result.success) setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 overflow-hidden ring-2 ring-[#085041]/10">
            <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
          </div>
          <p className="text-[18px] font-bold text-gray-900">Forgot Password</p>
          <p className="text-[13px] text-gray-500 mt-1">GCO Admin Portal - CvSU Imus Campus</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {!sent ? (
            <>
              <p className="text-[13px] text-gray-500 mb-5">Enter your username or email. We'll send you a reset link valid for 10 minutes.</p>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Username / Email</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. leeebisreal616@gmail.com"
                className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75]"
                required
              />
              <button type="submit" disabled={submitting} className={`w-full py-3.5 rounded-full text-[14.5px] font-semibold mt-4 ${submitting ? 'bg-gray-300 text-gray-500' : 'bg-[#085041] text-white'}`}>
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </>
          ) : (
            <p className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{message}</p>
          )}

          {message && !sent && <p className="text-[12.5px] text-red-500 mt-3">{message}</p>}

          <Link to="/admin/login" className="block text-center text-[13px] text-[#085041] font-semibold mt-4">Back to Login</Link>
        </form>
      </div>
    </div>
  )
}