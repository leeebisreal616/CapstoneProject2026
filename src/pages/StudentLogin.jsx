import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

const BASE = 'http://localhost/gco-api'

export default function StudentLogin() {
  const [studentId, setStudentId] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState(1) // 1 = Student ID, 2 = OTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const inputRefs = useRef([])

  // Pag galing sa Register page, show success + autofill ID
  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMsg(`Account created for ${location.state.student_id}! Please login with your Student ID.`)
      setStudentId(location.state.student_id || '')
      // Clear state para hindi mag-stay pag nag-refresh
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Countdown for resend
  const startCountdown = () => {
    setCountdown(30)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!studentId.trim()) { setError('Please enter your Student ID.'); return }
    setError(''); setSuccessMsg(''); setLoading(true)
    try {
      const res = await fetch(`${BASE}/students/send_otp.php?student_id=${studentId.trim()}`)
      const data = await res.json()
      if (data.success) {
        setStep(2); setSuccessMsg(data.message); setOtp(['', '', '', '', '', '']); startCountdown()
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      } else { setError(data.message || 'Student ID not found.') }
    } catch (err) { console.log(err); setError('API Error: ' + err.message) }
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
        localStorage.setItem('student', JSON.stringify(data.student))
        localStorage.setItem('student_id', data.student.student_id)
        navigate('/')
      } else {
        setError(data.message || 'Invalid code.'); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus()
      }
    } catch (err) { console.log(err); setError('API Error: ' + err.message) }
    setLoading(false)
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp); setError('')
    if (value && index < 5) { inputRefs.current[index + 1]?.focus() }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) { inputRefs.current[index - 1]?.focus() }
    if (e.key === 'Enter' && index === 5) { handleVerifyOtp(e) }
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
      const res = await fetch(`${BASE}/students/send_otp.php?student_id=${studentId.trim()}`)
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('New code sent to ' + data.message.replace('Code sent to ', ''))
        setOtp(['', '', '', '', '', '']); startCountdown(); inputRefs.current[0]?.focus()
      } else { setError(data.message) }
    } catch (err) { setError('API Error: ' + err.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f4f9f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#085041] rounded-full flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-6 h-6">
              <path d="M12 3L1 8l11 5 11-5-12-5z" strokeLinejoin="round" />
              <path d="M5 10v6c0 1.5 3 3 7 3s7-1.5 7-3v-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-gray-900">GCO Student Portal</h1>
          <p className="text-[13px] text-gray-500">CvSU Imus Campus</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {step === 1 ? (
            <>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1">Student Login</h2>
              <p className="text-[12px] text-gray-500 mb-5">We'll send a 6-digit code to your CvSU email.</p>
              <form onSubmit={handleSendOtp}>
                <label className="block text-[12px] font-semibold tracking-wide text-gray-700 mb-2">STUDENT ID</label>
                <input type="text" inputMode="numeric" placeholder="Enter your Student ID" value={studentId}
                  onChange={(e) => { setStudentId(e.target.value.replace(/\D/g, '').slice(0, 9)); setError('') }}
                  className="w-full h-[48px] px-4 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-colors" />
                {successMsg && (
                  <p className="text-[12px] text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-3">{successMsg}</p>
                )}
                {error && (
                  <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">{error}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full h-[48px] mt-5 bg-[#085041] hover:bg-[#063a2e] text-white text-[14px] font-semibold rounded-full transition-colors disabled:opacity-50">
                  {loading ? 'Sending Code...' : 'Send Login Code'}
                </button>
                <p className="text-[12px] text-center text-gray-500 mt-4">
                  New student? <Link to="/register" className="font-semibold text-[#085041]">Create Account</Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1">Enter Verification Code</h2>
              <p className="text-[12px] text-gray-500 mb-5">We sent a code to your CvSU email for <span className="font-semibold text-gray-900">{studentId}</span></p>
              <form onSubmit={handleVerifyOtp}>
                <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-[48px] h-[52px] text-center text-[20px] font-bold rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-colors" />
                  ))}
                </div>
                {successMsg && (
                  <p className="text-[12px] text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-3">{successMsg}</p>
                )}
                {error && (
                  <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">{error}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full h-[48px] mt-5 bg-[#085041] hover:bg-[#063a2e] text-white text-[14px] font-semibold rounded-full transition-colors disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify & Enter Portal'}
                </button>
                <div className="flex items-center justify-between mt-4">
                  <button type="button" onClick={() => { setStep(1); setError(''); setSuccessMsg(''); setOtp(['','','','','','']) }}
                    className="text-[12px] font-semibold text-gray-600 hover:text-gray-900">← Use different ID</button>
                  <button type="button" onClick={handleResend} disabled={countdown > 0 || loading}
                    className="text-[12px] font-semibold text-[#085041] hover:text-[#063a2e] disabled:opacity-40 disabled:cursor-not-allowed">
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-3">Code expires in 5 minutes. Check Spam if not in Inbox.</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}