import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../utils/adminAuth'

export default function AdminResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    const result = await resetPassword(token, password)
    setSubmitting(false)
    if (result.success) {
      setSuccess(result.message + ' Redirecting to login...')
      setTimeout(() => navigate('/admin/login'), 2000)
    } else {
      setError(result.message)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-5">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="font-bold">Invalid reset link</p>
          <p className="text-[13px] text-gray-500 mt-2">Please request a new reset link.</p>
          <Link to="/admin/forgot-password" className="block text-[13px] text-[#085041] font-semibold mt-4">Request New Link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-[18px] font-bold text-gray-900">Reset Password</p>
          <p className="text-[13px] text-gray-500 mt-1">Choose a new password for your admin account.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75] mb-4" required />
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirm New Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-3 text-[15px] outline-none focus:border-[#1D9E75]" required />

          {error && <p className="text-[12.5px] text-red-500 mt-3">{error}</p>}
          {success && <p className="text-[12.5px] text-green-600 mt-3">{success}</p>}

          <button type="submit" disabled={submitting} className={`w-full py-3.5 rounded-full text-[14.5px] font-semibold mt-4 ${submitting ? 'bg-gray-300 text-gray-500' : 'bg-[#085041] text-white'}`}>
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}