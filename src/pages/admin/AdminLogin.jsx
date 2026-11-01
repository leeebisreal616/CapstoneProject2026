import { useState } from 'react'
import { login } from '../../utils/adminAuth'

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
    <div className="min-h-screen flex bg-[#f6f8f7]">
      {/* LEFT - NO MORE DEAD SPACE */}
      <div className="hidden lg:flex w-[46%] bg-[#085041] p-10 flex-col justify-between relative overflow-hidden">
        {/* subtle glow */}
        <div className="absolute top-[-100px] right-[-100px] w-[360px] h-[360px] bg-white/[0.06] rounded-full blur-[50px]"></div>
        <div className="absolute bottom-[10%] left-[-50px] w-[280px] h-[280px] bg-black/20 rounded-full blur-[40px]"></div>

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
            <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[38px] font-bold text-white leading-[0.9] mt-8 tracking-tight">
            GCO Admin<br/>Portal
          </h1>
          <p className="text-[13px] text-white/60 mt-4 max-w-[320px] leading-relaxed">
            Guidance and Counseling Office<br/>CvSU Imus Campus
          </p>

          {/* CONTENT TO FILL DEAD SPACE */}
          <div className="mt-12 space-y-3 max-w-[360px]">
            <div className="bg-white/[0.08] border border-white/10 rounded-2xl p-4 flex gap-3 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-full bg-white text-[#085041] flex items-center justify-center font-bold text-[12px] shrink-0">1</div>
              <div>
                <p className="text-[12.5px] font-bold text-white">Manage Appointments</p>
                <p className="text-[11px] text-white/60 mt-1 leading-relaxed">View, approve, and track student counseling bookings in real time.</p>
              </div>
            </div>
            <div className="bg-white/[0.08] border border-white/10 rounded-2xl p-4 flex gap-3 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center font-bold text-[12px] shrink-0 border border-white/20">2</div>
              <div>
                <p className="text-[12.5px] font-bold text-white">Confidential & Secure</p>
                <p className="text-[11px] text-white/60 mt-1 leading-relaxed">Protected under RA 10173. Staff access only, audited.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6 text-[10px] text-white/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              System online • 3 pending today
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-[11px] text-white/30">© 2026 CvSU Imus • GCO v1</p>
          <p className="text-[10px] text-white/20 border border-white/10 rounded-full px-2.5 py-1">Staff only</p>
        </div>
      </div>

      {/* RIGHT - FORM */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-white mx-auto overflow-hidden ring-2 ring-[#085041]/10">
              <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
            </div>
            <p className="text-[18px] font-bold text-gray-900 mt-3">GCO Admin Portal</p>
            <p className="text-[12px] text-gray-500">CvSU Imus Campus</p>
          </div>

          <div className="bg-white rounded-[20px] border border-gray-200 p-6 md:p-7 shadow-sm">
            <p className="text-[16px] font-bold text-gray-900">Staff Login</p>
            <p className="text-[12.5px] text-gray-500 mt-1 mb-6">Sign in with your GCO staff account.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 mb-2">USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full border border-gray-300 rounded-full px-4 py-3 text-[13px] outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 mb-2">PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full border border-gray-300 rounded-full px-4 py-3 text-[13px] outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-all"
                  required
                />
              </div>

              {error && (
                <p className="text-red-600 text-[12px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">!</span>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3.5 rounded-full text-[13px] font-bold transition-all active:scale-[0.98] ${
                  submitting? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#085041] text-white hover:bg-[#0a5a49] shadow-sm'
                }`}
              >
                {submitting? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="mt-5 text-center">
            <button onClick={() => setShowHint(!showHint)} className="text-[11px] text-gray-400 hover:text-gray-600 underline transition-colors">
              {showHint? 'Hide demo credentials' : 'Show demo credentials'}
            </button>
            {showHint && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3 text-left">
                <p className="text-[11px] text-amber-900">Username: <b>admin</b></p>
                <p className="text-[11px] text-amber-900">Password: <b>gco2026</b></p>
                <p className="text-[10px] text-amber-700/70 mt-1.5 leading-relaxed">Prototype only. Real staff authentication will be integrated by the university IT team.</p>
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-6">Having trouble signing in? Contact the CvSU Imus IT Office.</p>
          </div>
        </div>
      </div>
    </div>
  )
}