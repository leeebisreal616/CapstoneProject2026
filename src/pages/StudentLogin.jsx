import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

// LOCAL: D:\xampp\htdocs\gco-api
const BASE = 'http://localhost/gco-api'
// LIVE: InfinityFree - ibalik mo to pag magde-deploy ka
// const BASE = 'https://gco-api.infinityfreeapp.com'

const EMPTY_OTP = ['', '', '', '', '', '']
const SERVER_ERROR = 'Cannot connect to server. Please try again.'

function Alert({ type, msg }) {
  if (!msg) return null
  const isError = type === 'error'
  return <p className={`text-[12px] rounded-lg px-3 py-2 mt-3 border ${isError ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'}`}>{msg}</p>
}

export default function StudentLogin() {
  const [studentId, setStudentId] = useState('')
  const [otp, setOtp] = useState(EMPTY_OTP)
  const [step, setStep] = useState(1) // 1 = Student ID, 2 = OTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const inputRefs = useRef([])

  // Pag galing sa Register, show success + autofill ID
  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMsg(`Account created for ${location.state.student_id}! Please login with your Student ID.`)
      setStudentId(location.state.student_id || '')
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Countdown - may cleanup na
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const sendCode = async () => {
    const res = await fetch(`${BASE}/students/send_otp.php?student_id=${studentId.trim()}`)
    return res.json()
  }

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!studentId.trim()) { setError('Please enter your Student ID.'); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    try {
      const data = await sendCode()
      if (data.success) {
        setStep(2); setSuccessMsg(data.message); setOtp(EMPTY_OTP); setCountdown(30)
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      } else setError(data.message || 'Student ID not found.')
    } catch { setError(SERVER_ERROR) }
    setLoading(false)
  }

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit code.'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${BASE}/students/verify_otp.php?student_id=${studentId.trim()}&otp=${code}`)
      const data = await res.json()
      if (data.success) {
        // Burahin yung lumang Counsellor session para hindi sya mabasa ni History
        // FIX: gco_counsellor na yung key ng Counsellor ngayon, hindi na 'admin' / 'counsellor' lang
        localStorage.removeItem('user');
        localStorage.removeItem('counsellor');
        localStorage.removeItem('admin');
        localStorage.removeItem('gco_counsellor');
        localStorage.removeItem('gco_counsellor_access');
        localStorage.removeItem('gco_counsellor_refresh');
        localStorage.removeItem('gco_counsellor_expires');
        localStorage.removeItem('gco_admin');
        localStorage.removeItem('gco_admin_access');
        localStorage.removeItem('gco_admin_refresh');
        localStorage.removeItem('gco_admin_expires');
        sessionStorage.removeItem('gco_admin_session');
        localStorage.setItem('student', JSON.stringify(data.student))
        localStorage.setItem('student_id', data.student.student_id)
        navigate('/')
      } else {
        setError(data.message || 'Invalid code.'); setOtp(EMPTY_OTP); inputRefs.current[0]?.focus()
      }
    } catch { setError(SERVER_ERROR) }
    setLoading(false)
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]; next[index] = value.slice(-1); setOtp(next); setError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'Enter' && index === 5) handleVerifyOtp(e)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) { setOtp(pasted.split('')); inputRefs.current[5]?.focus() }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError(''); setLoading(true)
    try {
      const data = await sendCode()
      if (data.success) {
        setSuccessMsg('New code sent to ' + data.message.replace('Code sent to ', ''))
        setOtp(EMPTY_OTP); setCountdown(30); inputRefs.current[0]?.focus()
      } else setError(data.message)
    } catch { setError(SERVER_ERROR) }
    setLoading(false)
  }

  const goBackToId = () => {
    setStep(1); setError(''); setSuccessMsg(''); setOtp(EMPTY_OTP)
  }

  return (
    <div className="min-h-screen bg-[#f4f9f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-6">
          {/* FIX: Same logo na sa Counsellor Login - gco-seal.png, hindi na SVG icon */}
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 overflow-hidden ring-2 ring-[#085041]/10">
            <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[20px] font-bold text-gray-900">GCO Student Login</h1>
          <p className="text-[13px] text-gray-500">Guidance and Counseling Office <span className="mx-1 text-gray-300">|</span> CvSU Imus Campus</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {step === 1 ? (
            <>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1">Student Login</h2>
              <p className="text-[12px] text-gray-500 mb-5">We'll send a 6-digit code to your CvSU email.</p>
              <form onSubmit={handleSendOtp}>
                <label className="block text-[12px] font-semibold tracking-wide text-gray-700 mb-2">STUDENT ID</label>
                <input type="text" inputMode="numeric" placeholder="Enter your Student ID" value={studentId} onChange={(e) => { setStudentId(e.target.value.replace(/\D/g, '').slice(0, 9)); setError('') }} className="w-full h-[48px] px-4 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-colors" />
                <Alert type="success" msg={successMsg} />
                <Alert type="error" msg={error} />
                <button type="submit" disabled={loading} className="w-full h-[48px] mt-5 bg-[#085041] hover:bg-[#063a2e] text-white text-[14px] font-semibold rounded-full transition-colors disabled:opacity-50">
                  {loading ? 'Sending Code...' : 'Send Login Code'}
                </button>
                <p className="text-[12px] text-center text-gray-500 mt-4">New student? <Link to="/register" className="font-semibold text-[#085041]">Create Account</Link></p>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1">Enter Verification Code</h2>
              <p className="text-[12px] text-gray-500 mb-5">We sent a code to your CvSU email for <span className="font-semibold text-gray-900">{studentId}</span></p>
              <form onSubmit={handleVerifyOtp}>
                <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} className="w-[48px] h-[52px] text-center text-[20px] font-bold rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-colors" />
                  ))}
                </div>
                <Alert type="success" msg={successMsg} />
                <Alert type="error" msg={error} />
                <button type="submit" disabled={loading} className="w-full h-[48px] mt-5 bg-[#085041] hover:bg-[#063a2e] text-white text-[14px] font-semibold rounded-full transition-colors disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <div className="flex items-center justify-between mt-4">
                  <button type="button" onClick={goBackToId} className="text-[12px] font-semibold text-gray-600 hover:text-gray-900">← Use different ID</button>
                  <button type="button" onClick={handleResend} disabled={countdown > 0 || loading} className="text-[12px] font-semibold text-[#085041] hover:text-[#063a2e] disabled:opacity-40 disabled:cursor-not-allowed">
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-3">Code expires in 5 minutes. Check Spam if not in Inbox.</p>
              </form>
            </>
          )}
        </div>

        {/* GCO Counsellor - hiwalay na tab */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
          <span className="text-[12px] text-gray-500">Are you a GCO Counsellor?</span>
          <button type="button" onClick={() => window.open('/counsellor/login', '_blank', 'noopener,noreferrer')} className="text-[12px] font-bold text-[#085041] hover:underline flex items-center gap-1" >
            Counsellor Login <span className="text-[10px]">↗</span>
          </button>
        </div>
      </div>
    </div>
  )
}