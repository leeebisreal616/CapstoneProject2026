import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

// LOCAL: D:\xampp\htdocs\gco-api
const BASE = 'https://cheerful-magenta-fly-38.hostingersite.com/api'
// LIVE: InfinityFree - ibalik mo to pag magde-deploy ka
// const BASE = 'https://gco-api.infinityfreeapp.com'

const SERVER_ERROR = 'Cannot connect to server. Please try again.'

const COURSES = [
  'Bachelor of Arts in Journalism',
  'Bachelor of Early Childhood Education',
  'Bachelor of Elementary Education',
  'Bachelor of Science in Business Administration',
  'Bachelor of Science in Computer Science',
  'Bachelor of Science in Entrepreneurship',
  'Bachelor of Science in Hospitality Management',
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Office Administration',
  'Bachelor of Science in Psychology',
  'Bachelor of Secondary Education',
]

export default function Register() {
  const [form, setForm] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    middle_initial: '',
    email: '',
    course: '',
    year_level: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  // Auto-generate: Lorenz Justin + Sarte -> lorenzjustin.sarte@cvsu.edu.ph
  const buildEmail = (first, last) => {
    const clean = (s) => s.toLowerCase().trim().replace(/[^a-z ]/g, '').split(' ').filter(Boolean).join('')
    const f = clean(first)
    const l = clean(last)
    if (!f && !l) return ''
    if (f && l) return `${f}.${l}@cvsu.edu.ph`
    if (f) return `${f}@cvsu.edu.ph`
    return `${l}@cvsu.edu.ph`
  }

  const handleNameChange = (key, value) => {
    const newForm = { ...form, [key]: value }
    if (emailTouched) { setForm(newForm); return }
    const autoEmail = buildEmail(
      key === 'first_name' ? value : newForm.first_name,
      key === 'last_name' ? value : newForm.last_name
    )
    setForm({ ...newForm, email: autoEmail })
  }

  const handleEmailChange = (value) => {
    set('email', value)
    // Pag binura ng buo, balik sa auto-fill. Pag nag-type, manual na.
    setEmailTouched(value.trim() !== '')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Frontend validation - para hindi na umabot sa backend yung blanko
    if (form.student_id.length !== 9) { setError('Student ID must be 9 digits.'); return }
    if (!form.first_name.trim()) { setError('Please enter your First Name.'); return }
    if (!form.last_name.trim()) { setError('Please enter your Last Name.'); return }
    if (!form.email.trim() || !form.email.endsWith('@cvsu.edu.ph')) { setError('Please use your CvSU email (@cvsu.edu.ph).'); return }
    if (!form.course) { setError('Please select your Course.'); return }
    if (!form.year_level) { setError('Please select your Year Level.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${BASE}/students/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        navigate('/login', { state: { registered: true, student_id: form.student_id } })
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch {
      setError(SERVER_ERROR)
    }
    setLoading(false)
  }

  const inputCls = "w-full h-[48px] px-4 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#085041] focus:ring-2 focus:ring-[#085041]/10 transition-colors"

  return (
    <div className="min-h-screen bg-[#f4f9f7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#085041] rounded-full flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-6 h-6">
              <path d="M12 3L1 8l11 5 11-5-12-5z" strokeLinejoin="round" />
              <path d="M5 10v6c0 1.5 3 3 7 3s7-1.5 7-3v-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-gray-900">GCO Student Registration</h1>
          <p className="text-[13px] text-gray-500">Guidance and Counseling Office <span className="mx-1 text-gray-300">|</span> CvSU Imus Campus</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">Create Student Account</h2>
          <p className="text-[12px] text-gray-500 mb-5">For CvSU Imus students only.</p>

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-2">STUDENT ID</label>
              <input className={inputCls} placeholder="e.g. 202311325" inputMode="numeric" value={form.student_id} onChange={(e) => set('student_id', e.target.value.replace(/\D/g, '').slice(0, 9))} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">FIRST NAME</label>
                <input className={inputCls} placeholder="Juan" value={form.first_name} onChange={(e) => handleNameChange('first_name', e.target.value)} />
              </div>
              <div className="w-[70px]">
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">M.I.</label>
                <input className={inputCls + " text-center"} placeholder="Optional" maxLength={1} value={form.middle_initial} onChange={(e) => set('middle_initial', e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase())} />
              </div>
              <div className="flex-1">
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">LAST NAME</label>
                <input className={inputCls} placeholder="Dela Cruz" value={form.last_name} onChange={(e) => handleNameChange('last_name', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-2">CvSU EMAIL</label>
              <input className={inputCls} placeholder="Auto-filled from your name" type="email" value={form.email} onChange={(e) => handleEmailChange(e.target.value)} />
              <p className="text-[11px] text-gray-400 mt-1">Auto-filled from your name. You can still edit it if needed.</p>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">COURSE</label>
                <select className={inputCls} value={form.course} onChange={(e) => set('course', e.target.value)}>
                  <option value="">Select Course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="w-[130px]">
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">YEAR LEVEL</label>
                <select className={inputCls} value={form.year_level} onChange={(e) => set('year_level', e.target.value)}>
                  <option value="">Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            {error && <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="w-full h-[48px] bg-[#085041] hover:bg-[#063a2e] text-white text-[14px] font-semibold rounded-full transition-colors disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <p className="text-[12px] text-center text-gray-500">Already have an account? <Link to="/login" className="font-semibold text-[#085041]">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}