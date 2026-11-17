import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

// LOCAL: D:\xampp\htdocs\gco-api
const BASE = 'http://localhost/gco-api'
// LIVE: InfinityFree - ibalik mo to pag magde-deploy ka
// const BASE = 'https://gco-api.infinityfreeapp.com'

export default function Register() {
  const [form, setForm] = useState({ student_id: '', first_name: '', last_name: '', middle_initial: '', email: '', course: '', year_level: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false) // pag ikaw nag-type ng email, stop auto
  const navigate = useNavigate()
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  // LIVE auto-generate: kahit 1 letter pa lang, generate na agad
  // Lorenz -> lorenz@cvsu.edu.ph
  // Lorenz Justin -> lorenzjustin@cvsu.edu.ph
  // Lorenz Justin + Sarte -> lorenzjustin.sarte@cvsu.edu.ph
  // Pag nag-backspace -> nabubura din yung email
  const buildEmail = (first, last) => {
    const clean = (s) => s.toLowerCase().trim().replace(/[^a-z ]/g, '').split(' ').filter(Boolean).join('') || ''
    const f = clean(first) // lahat ng first names pinagdikit - Lorenz Justin = lorenzjustin
    const l = clean(last) // Dela Cruz = delacruz
    if (!f && !l) return '' // pag binura lahat, burado din email
    if (f && l) return `${f}.${l}@cvsu.edu.ph`
    if (f) return `${f}@cvsu.edu.ph` // First Name pa lang naka-type, live na agad
    return `${l}@cvsu.edu.ph` // Last Name pa lang naka-type
  }

  // LIVE: kada type / backspace, update agad yung email
  const handleNameChange = (key, value) => {
    const newForm = { ...form, [key]: value }
    if (emailTouched) { setForm(newForm); return }
    const autoEmail = buildEmail(
      key === 'first_name' ? value : newForm.first_name,
      key === 'last_name' ? value : newForm.last_name
    )
    setForm({ ...newForm, email: autoEmail }) // kahit '' yan, i-set pa rin para mabura pag nag-backspace
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
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
        setError(data.message)
      }
    } catch (err) { setError('API Error: ' + err.message) }
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
          <h1 className="text-[20px] font-bold text-gray-900">GCO Student Portal</h1>
          <p className="text-[13px] text-gray-500">CvSU Imus Campus</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">Create Student Account</h2>
          <p className="text-[12px] text-gray-500 mb-5">For CvSU Imus students only.</p>
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-2">STUDENT ID</label>
              <input className={inputCls} placeholder="e.g. 202311325" value={form.student_id} onChange={(e) => set('student_id', e.target.value.replace(/\D/g, '').slice(0, 9))} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">FIRST NAME</label>
                <input className={inputCls} placeholder="Juan" value={form.first_name} onChange={(e) => handleNameChange('first_name', e.target.value)} />
              </div>
              <div className="w-[105px]">
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
              <input className={inputCls} placeholder="Auto-filled from your name" type="email" value={form.email} onChange={(e) => { set('email', e.target.value); setEmailTouched(e.target.value !== '') }} />
              <p className="text-[11px] text-gray-400 mt-1">Live auto-filled from your name. You can still edit it if needed.</p>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">COURSE</label>
                <select className={inputCls} value={form.course} onChange={(e) => set('course', e.target.value)}>
                  <option value="">Select Course</option>
                  <option value="BA Journalism">Bachelor of Arts in Journalism</option>
                  <option value="BECED">Bachelor of Early Childhood Education</option>
                  <option value="BEED">Bachelor of Elementary Education</option>
                  <option value="BSBA">Bachelor of Science in Business Administration</option>
                  <option value="BSCS">Bachelor of Science in Computer Science</option>
                  <option value="BS Entrep">Bachelor of Science in Entrepreneurship</option>
                  <option value="BSHM">Bachelor of Science in Hospitality Management</option>
                  <option value="BSIT">Bachelor of Science in Information Technology</option>
                  <option value="BSOA">Bachelor of Science in Office Administration</option>
                  <option value="BS Psych">Bachelor of Science in Psychology</option>
                  <option value="BSED">Bachelor of Secondary Education</option>
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
            <p className="text-[12px] text-center text-gray-500">
              Already have an account? <Link to="/login" className="font-semibold text-[#085041]">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}