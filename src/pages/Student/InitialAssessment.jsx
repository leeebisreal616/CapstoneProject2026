import { useState, useEffect } from 'react'

// LOCAL: D:\xampp\htdocs\gco-api
const BASE = 'http://localhost/gco-api/assessment_results'
const INVENTORY_BASE = 'http://localhost/gco-api/student_profile'
// LIVE: InfinityFree - ibalik mo to pag magde-deploy ka
// const BASE = 'https://gco-api.infinityfreeapp.com/assessment_results'

// ---------- Shared ----------
const LIKERT = ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']
const FREQ = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never']

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || localStorage.getItem('student') || localStorage.getItem('gco_user') || '{}') } catch { return {} }
}
const getSid = () => { const u = getStoredUser(); return u.student_id || u.student_number || '202311325' }

function Divider() { return <span className="w-px h-3 bg-gray-300 shrink-0" /> }
function DoneBadge() { return <span className="ml-2 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full align-middle">DONE</span> }

// ---------- Exams - questions lang, opts 1x lang ----------
const exams = {
  personality: {
    title: 'Personality Profile',
    desc: 'Understand your traits and behavioral tendencies.',
    opts: LIKERT,
    questions: [
      'I enjoy meeting and talking with new people.',
      'I prefer to plan things ahead rather than be spontaneous.',
      'I stay calm and composed even in stressful situations.',
      'I enjoy thinking about abstract ideas and concepts.',
      "I tend to put others' needs before my own.",
      'I find it easy to stay focused on a task until it is completed.',
      'I feel comfortable being the center of attention in a group.',
      'I adapt easily to changes in plans or routines.',
      'I often reflect on my emotions and feelings.',
      'I take initiative and motivate others around me.',
    ],
    score(ans) {
      const s = ans.reduce((a, b) => a + (4 - b), 0)
      if (s >= 30) return { label: 'Leadership Oriented', color: '#085041', bg: '#E8F5F1', desc: 'You tend to be outgoing, proactive, and enjoy social interaction.', flag: 'Normal' }
      if (s >= 20) return { label: 'Balanced', color: '#185FA5', bg: '#e6f1fb', desc: 'Healthy mix of introversion and extraversion. You adapt well.', flag: 'Normal' }
      return { label: 'Reflective', color: '#3C3489', bg: '#ede9fe', desc: 'Thoughtful and introspective. You thrive in roles that require careful analysis.', flag: 'Monitor' }
    },
  },
  wellbeing: {
    title: 'Well-Being Profile',
    desc: 'Assess your mental, emotional, and physical well-being.',
    opts: FREQ,
    questions: [
      'Over the past week, I have felt happy and content most of the time.',
      'I have been able to manage my stress effectively this week.',
      'I feel connected to my friends and family.',
      'I have had enough energy to carry out my daily activities.',
      'I have been sleeping well and waking up feeling rested.',
      'I feel motivated to attend my classes and complete my schoolwork.',
      'I have been eating regularly and maintaining a healthy diet.',
      'I feel safe and secure in my living environment.',
      'I have someone I can talk to when I am going through a difficult time.',
      'Overall, I feel satisfied with my life as a student right now.',
    ],
    score(ans) {
      const s = ans.reduce((a, b) => a + (4 - b), 0)
      if (s >= 30) return { label: 'Good Well-Being', color: '#085041', bg: '#E8F5F1', desc: 'Managing well across physical, emotional, and social dimensions.', flag: 'Normal' }
      if (s >= 18) return { label: 'Moderate Well-Being', color: '#B45309', bg: '#FEF3C7', desc: 'Some areas of strength but may benefit from additional support.', flag: 'Monitor' }
      return { label: 'Needs Attention', color: '#9B1C1C', bg: '#FEE2E2', desc: 'You may be experiencing challenges. Please reach out to GCO.', flag: 'High' }
    },
  },
}

// ---------- Confirm ----------
function ConfirmModal({ answered, total, onConfirm, onReview }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onReview() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onReview])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onReview() }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-[0_16px_40px_rgba(0,0,0,0.15)]">
        <h3 className="text-[16px] font-bold text-gray-900 text-center">Submit exam?</h3>
        <p className="text-[13px] text-gray-500 text-center mt-2">You answered {answered} of {total}. You cannot change answers after submitting.</p>
        <button onClick={onConfirm} className="bg-[#085041] text-white text-[14px] font-semibold py-3 rounded-full w-full mt-5 hover:bg-[#0a5a49] active:scale-[0.98]">Confirm Submit</button>
        <button onClick={onReview} className="w-full mt-2 text-[13px] font-semibold text-gray-600 py-2 rounded-full hover:bg-gray-100">Review Answers</button>
      </div>
    </div>
  )
}

// ---------- PSGC - 1 helper lang ----------
function usePSGC() {
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loading, setLoading] = useState({ provinces: false, cities: false, barangays: false })

  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/regions/').then(r => r.json())
      .then(d => setRegions(d.sort((a, b) => a.name.localeCompare(b.name)))).catch(() => {})
  }, [])

  const load = async (url, key, setList) => {
    setLoading(l => ({ ...l, [key]: true }))
    try { const d = await fetch(url).then(x => x.json()); setList(d); return d } catch { return [] }
    finally { setLoading(l => ({ ...l, [key]: false })) }
  }

  const loadProvinces = async (regionCode) => {
    setProvinces([]); setCities([]); setBarangays([])
    if (!regionCode) return
    const r = await load(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`, 'provinces', setProvinces)
    if (!r || r.length === 0) await load(`https://psgc.gitlab.io/api/regions/${regionCode}/cities-municipalities/`, 'cities', setCities)
  }
  const loadCities = async (provinceCode) => {
    setCities([]); setBarangays([])
    if (!provinceCode) return
    await load(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`, 'cities', setCities)
  }
  const loadBarangays = async (cityCode) => {
    setBarangays([])
    if (!cityCode) return
    await load(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`, 'barangays', setBarangays)
  }
  return { regions, provinces, cities, barangays, loading, loadProvinces, loadCities, loadBarangays }
}

// ---------- Shared form pieces ----------
const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#085041] bg-white"
const labelCls = "text-[12px] font-bold text-gray-700 block mb-1.5"

function Field({ label, children, span }) {
  return <div className={span ? 'md:col-span-2' : ''}><label className={labelCls}>{label}</label>{children}</div>
}
function TextField({ label, value, onChange, placeholder, type = 'text' }) {
  return <Field label={label}><input type={type} className={inputCls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></Field>
}
function SelectField({ label, value, onChange, children }) {
  return <Field label={label}><select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>{children}</select></Field>
}

// ---------- Profile ----------
function ProfileScreen({ onBack, onSaved }) {
  const storedUser = getStoredUser()
  const psgc = usePSGC()
  const [form, setForm] = useState({
    student_id: storedUser.student_id || storedUser.student_number || '',
    nickname: storedUser.nickname || '',
    place_of_birth: '', religion: '', college_department: storedUser.course || '',
    year_admitted: new Date().getFullYear().toString(), scholarship_status: 'None',
    father_name: '', father_occupation: '', mother_name: '', mother_occupation: '',
    guardian_name: '', monthly_family_income: '', number_of_siblings: '0',
    birth_order: '', health_condition: 'None',
  })
  const [addr, setAddr] = useState({ region: '', regionName: '', province: '', provinceName: '', city: '', cityName: '', barangay: '', barangayName: '', exact: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const buildHomeAddress = () => [addr.exact, addr.barangayName, addr.cityName, addr.provinceName, addr.regionName].filter(Boolean).join(', ')

  const handleSave = async () => {
    const required = ['student_id', 'nickname', 'place_of_birth', 'religion', 'college_department', 'year_admitted']
    for (const k of required) {
      if (!form[k] || String(form[k]).trim() === '') { setError(`Please fill up: ${k.replaceAll('_', ' ')}`); return }
    }
    if (!addr.region || !addr.city || !addr.barangay || !addr.exact.trim()) { setError('Please complete your Home Address (Region → City → Barangay → House No. / Street)'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, home_address: buildHomeAddress(), year_admitted: parseInt(form.year_admitted), number_of_siblings: parseInt(form.number_of_siblings || 0) }
      const res = await fetch(INVENTORY_BASE + '/create_student_profile.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.success) { localStorage.setItem('gco_student_profile_done', '1'); onSaved() }
      else setError(data.message || 'Failed to save. Try again.')
    } catch { setError('Cannot connect to server. Check if XAMPP is running.') }
    setSaving(false)
  }

  const onSelect = (e, keys, resetKeys, loader) => {
    const opt = e.target.options[e.target.selectedIndex]
    setAddr(a => {
      const next = { ...a, [keys[0]]: e.target.value, [keys[1]]: opt.text }
      resetKeys.forEach(([k1, k2]) => { next[k1] = ''; next[k2] = '' })
      return next
    })
    if (loader) loader(e.target.value)
  }

  return (
    <div className="bg-[#f6f8f7] w-full">
      <div className="bg-[#085041] px-6 md:px-10 py-6 text-white">
        <p className="text-[11px] text-white/50 tracking-widest font-bold">STEP 1 OF 3 <span className="mx-1.5 text-white/30">|</span> INVENTORY</p>
        <h2 className="text-[20px] font-bold mt-3">Student Profile</h2>
        <p className="text-[13px] text-white/70 mt-3">This goes to Inventory Submissions for your counselor to review.</p>
      </div>

      <div className="px-4 md:px-10 py-6 max-w-[720px] mx-auto space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl p-3">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[13px] font-bold text-gray-900">Personal Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField label="Student ID *" value={form.student_id} onChange={v => set('student_id', v)} placeholder="202311325" />
            <TextField label="Nickname *" value={form.nickname} onChange={v => set('nickname', v)} placeholder="How do you want to be called?" />
            <TextField label="Place of Birth *" value={form.place_of_birth} onChange={v => set('place_of_birth', v)} placeholder="City / Province" />
            <TextField label="Religion *" value={form.religion} onChange={v => set('religion', v)} placeholder="e.g. Roman Catholic" />

            <Field label="Home Address *" span>
              <div className="space-y-3">
                <select className={inputCls} value={addr.region} onChange={e => onSelect(e, ['region', 'regionName'], [['province', 'provinceName'], ['city', 'cityName'], ['barangay', 'barangayName']], psgc.loadProvinces)}>
                  <option value="">Select Region</option>
                  {psgc.regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                </select>
                {psgc.provinces.length > 0 && (
                  <select className={inputCls} value={addr.province} onChange={e => onSelect(e, ['province', 'provinceName'], [['city', 'cityName'], ['barangay', 'barangayName']], psgc.loadCities)}>
                    <option value="">{psgc.loading.provinces ? 'Loading provinces...' : 'Select Province'}</option>
                    {psgc.provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                )}
                <select className={inputCls} value={addr.city} disabled={!addr.region} onChange={e => onSelect(e, ['city', 'cityName'], [['barangay', 'barangayName']], psgc.loadBarangays)}>
                  <option value="">{psgc.loading.cities ? 'Loading cities...' : 'Select City / Municipality'}</option>
                  {psgc.cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <select className={inputCls} value={addr.barangay} disabled={!addr.city} onChange={e => onSelect(e, ['barangay', 'barangayName'], [])}>
                  <option value="">{psgc.loading.barangays ? 'Loading barangays...' : 'Select Barangay'}</option>
                  {psgc.barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
                <input className={inputCls} value={addr.exact} onChange={e => setAddr(a => ({ ...a, exact: e.target.value }))} placeholder="House No. / Street / Subdivision (e.g. Blk 5 Lot 12, Green Estate)" />
                {addr.barangayName && <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">Preview: <span className="text-gray-800 font-semibold">{buildHomeAddress()}</span></p>}
              </div>
            </Field>

            <TextField label="College / Department *" value={form.college_department} onChange={v => set('college_department', v)} placeholder="e.g. BSIT / CCS" />
            <TextField label="Year Admitted *" type="number" value={form.year_admitted} onChange={v => set('year_admitted', v)} placeholder="2023" />
            <SelectField label="Scholarship Status" value={form.scholarship_status} onChange={v => set('scholarship_status', v)}>
              <option>None</option><option>Academic Scholar</option><option>CHED / UniFAST</option><option>Private Scholarship</option><option>Others</option>
            </SelectField>
            <TextField label="Health Condition" value={form.health_condition} onChange={v => set('health_condition', v)} placeholder="None / Asthma / etc." />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[13px] font-bold text-gray-900">Family Background</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField label="Father's Name" value={form.father_name} onChange={v => set('father_name', v)} placeholder="Father's full name" />
            <TextField label="Father's Occupation" value={form.father_occupation} onChange={v => set('father_occupation', v)} placeholder="e.g. Driver" />
            <TextField label="Mother's Name" value={form.mother_name} onChange={v => set('mother_name', v)} placeholder="Mother's full name" />
            <TextField label="Mother's Occupation" value={form.mother_occupation} onChange={v => set('mother_occupation', v)} placeholder="e.g. Teacher" />
            <TextField label="Guardian Name (if different)" value={form.guardian_name} onChange={v => set('guardian_name', v)} placeholder="Guardian" />
            <SelectField label="Monthly Family Income" value={form.monthly_family_income} onChange={v => set('monthly_family_income', v)}>
              <option value="">Select</option><option>Below ₱10,000</option><option>₱10,000 - ₱20,000</option><option>₱20,000 - ₱40,000</option><option>₱40,000+</option>
            </SelectField>
            <TextField label="Number of Siblings" type="number" value={form.number_of_siblings} onChange={v => set('number_of_siblings', v)} />
            <SelectField label="Birth Order" value={form.birth_order} onChange={v => set('birth_order', v)}>
              <option value="">Select</option><option>Eldest</option><option>Middle</option><option>Youngest</option><option>Only Child</option>
            </SelectField>
          </div>
        </div>

        <div className="flex gap-3 pb-4">
          <button onClick={onBack} className="px-6 py-3 rounded-full border border-gray-200 text-[13px] font-semibold bg-white">Back</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-full text-[13px] font-bold bg-[#085041] text-white hover:bg-[#0a5a49] disabled:opacity-50">{saving ? 'Saving...' : 'Submit Student Profile'}</button>
        </div>
        <p className="text-[11px] text-gray-400 text-center">Confidential. Only your GCO counselor can view this. RA 10173 protected.</p>
      </div>
    </div>
  )
}

// ---------- Exam ----------
function ExamScreen({ type, onBack }) {
  const exam = exams[type]
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(new Array(exam.questions.length).fill(null))
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const total = exam.questions.length
  const answeredCount = answers.filter(a => a !== null).length
  const score = answers.reduce((a, b) => a + (4 - (b ?? 0)), 0)
  const pct = Math.round((score / (total * 4)) * 100)

  const handleSubmitToDB = async () => {
    setSaving(true)
    const resScore = exam.score(answers)
    try {
      await fetch(BASE + '/create_result.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: getSid(), exam_type: type, score, result_label: resScore.label, flag_level: resScore.flag }) })
    } catch (e) { console.error(e) }
    setSaving(false); setShowConfirm(false); setDone(true)
  }

  if (done) {
    const res = exam.score(answers)
    return (
      <div className="bg-[#f6f8f7] w-full">
        <div className="bg-[#085041] px-6 md:px-10 py-6 text-white">
          <p className="text-[11px] text-white/50 tracking-widest font-bold">RESULTS SAVED</p>
          <h2 className="text-[20px] font-bold mt-3">{exam.title}</h2>
        </div>
        <div className="px-4 md:px-10 py-6 max-w-[720px] mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-[64px] h-[64px] shrink-0 rounded-full bg-[#E8F5F1] flex items-center justify-center text-[#085041] font-bold text-[18px]">{pct}%</div>
              <div>
                <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: res.bg, color: res.color }}>{res.label}</span>
                <p className="text-[13px] text-gray-600 mt-2">{res.desc} Saved to GCO.</p>
              </div>
            </div>
            <button onClick={onBack} className="bg-[#085041] text-white text-[13px] font-semibold py-3 rounded-full w-full mt-5">Back to Assessments</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f6f8f7] w-full">
      {showConfirm && <ConfirmModal answered={answeredCount} total={total} onConfirm={handleSubmitToDB} onReview={() => setShowConfirm(false)} />}
      <div className="bg-white border-b border-gray-200 px-6 md:px-10 py-4 flex justify-between items-center sticky top-[60px] z-10">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">{exam.title}</h2>
          <p className="text-[12px] text-gray-500">Question {current + 1} of {total}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-bold text-gray-400 hidden md:block">{Math.round(((current + 1) / total) * 100)}%</p>
          <div className="w-[100px] md:w-[140px] h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[#085041] transition-all duration-300" style={{ width: ((current + 1) / total) * 100 + '%' }} /></div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 max-w-[1280px] mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 h-fit">
          <p className="text-[18px] md:text-[20px] font-semibold text-gray-900 leading-snug">{exam.questions[current]}</p>
          <div className="flex flex-col gap-2.5 mt-6">
            {exam.opts.map((o, i) => {
              const active = answers[current] === i
              return (
                <button key={i} onClick={() => { const u = [...answers]; u[current] = i; setAnswers(u) }} className={'px-4 py-3.5 rounded-xl border text-left text-[14px] flex items-center gap-3 transition-all ' + (active ? 'border-[#085041] bg-[#E8F5F1] text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:border-[#085041]/30')}>
                  <span className={'w-7 h-7 shrink-0 rounded-full border flex items-center justify-center text-[11px] font-bold ' + (active ? 'bg-[#085041] border-[#085041] text-white' : 'border-gray-300 text-gray-500 bg-gray-50')}>{String.fromCharCode(65 + i)}</span>
                  {o}
                </button>
              )
            })}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="px-6 py-3 rounded-full border border-gray-200 text-[13px] font-semibold disabled:opacity-40">Back</button>
            <button onClick={() => current === total - 1 ? setShowConfirm(true) : setCurrent(c => c + 1)} disabled={answers[current] === null || saving} className={'flex-1 py-3 rounded-full text-[13px] font-bold ' + (answers[current] === null ? 'bg-gray-200 text-gray-400' : 'bg-[#085041] text-white hover:bg-[#0a5a49]')}>{saving ? 'Saving...' : current === total - 1 ? 'Submit' : 'Next'}</button>
          </div>
        </div>

        <div className="space-y-4 h-fit lg:sticky lg:top-[88px]">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-widest text-gray-400">YOUR PROGRESS</p>
            <div className="flex gap-1.5 mt-3">{Array.from({ length: total }).map((_, idx) => (<div key={idx} className={'h-2 flex-1 rounded-full ' + (idx <= current ? 'bg-[#085041]' : answers[idx] !== null ? 'bg-[#085041]/50' : 'bg-gray-200')} />))}</div>
            <p className="text-[12px] text-gray-500 mt-3">{answeredCount} of {total} answered</p>
          </div>
          <div className="bg-[#085041] rounded-2xl p-5 text-white"><p className="text-[10px] font-bold tracking-widest text-white/50">CONFIDENTIAL</p><p className="text-[12px] text-white/80 mt-2">Only your GCO counselor can view this. RA 10173 protected.</p></div>
        </div>
      </div>
    </div>
  )
}

// ---------- List ----------
export default function Assessment() {
  const [view, setView] = useState('list')
  const [completed, setCompleted] = useState([])
  const [profileDone, setProfileDone] = useState(false)

  useEffect(() => {
    const sid = getSid()
    if (localStorage.getItem('gco_student_profile_done') === '1') setProfileDone(true)
    fetch(INVENTORY_BASE + '/get_student_profile.php?student_id=' + sid).then(r => r.json())
      .then(d => { if (d && Array.isArray(d.submissions) && d.submissions.length > 0) setProfileDone(true) }).catch(() => {})
    fetch(BASE + '/get_results.php?student_id=' + sid).then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCompleted(d.map(x => x.exam_type === 'Well-Being' ? 'wellbeing' : x.exam_type === 'Personality' ? 'personality' : x.exam_type.toLowerCase())) }).catch(() => {})
  }, [view])

  if (view === 'profile') return <ProfileScreen onBack={() => setView('list')} onSaved={() => { setProfileDone(true); setView('list') }} />
  if (view !== 'list') return <ExamScreen type={view} onBack={() => setView('list')} />

  const isDone = (key) => completed.includes(key)
  const totalDone = (profileDone ? 1 : 0) + completed.length

  const cardCls = (done) => 'bg-white rounded-2xl border p-6 flex flex-col group hover:shadow-[0_12px_32px_rgba(8,80,65,0.14)] hover:-translate-y-[1px] transition-all ' + (done ? 'border-green-300' : 'border-gray-200')
  const btnCls = (done, locked) => 'text-[12px] font-bold py-2.5 rounded-full w-full mt-4 transition-all ' + (locked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : done ? 'bg-white border border-green-600 text-green-700 hover:bg-green-50' : 'bg-[#085041] text-white hover:bg-[#0a5a49]')

  return (
    <div className="bg-[#f6f8f7] w-full flex flex-col">
      <div className="bg-[#085041] px-6 md:px-10 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between shrink-0">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-[0.95] tracking-tight">Initial Assessment</h2>
          <p className="text-[13px] md:text-[14px] text-white/70 mt-3 max-w-[440px] leading-relaxed">Complete all 3 steps. Required before booking counseling. Helps your counselor understand your current state.</p>
        </div>
        <div className="w-full lg:w-[360px] bg-[#0a5a49] border border-white/10 rounded-2xl p-5 shrink-0">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-3">YOUR PROGRESS</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center"><p className="text-[20px] font-bold text-white">{totalDone}/3</p><p className="text-[10px] text-white/50 mt-1">Completed</p></div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center"><p className="text-[20px] font-bold text-white">21</p><p className="text-[10px] text-white/50 mt-1">Total items</p></div>
          </div>
          <p className="text-[10px] text-white/50 mt-3">Confidential. Only your GCO counselor sees this. RA 10173.</p>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 max-w-[1280px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-fit">
          {/* Profile Card */}
          <div className={cardCls(profileDone)}>
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] transition-colors ' + (profileDone ? 'bg-green-600 text-white' : 'bg-[#E8F5F1] text-[#085041] group-hover:bg-[#085041] group-hover:text-white')}>{profileDone ? '✓' : '1'}</div>
            <p className="text-[15px] font-bold text-gray-900 mt-4">Student Profile {profileDone && <DoneBadge />}</p>
            <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed flex-1">Your personal details + family background. This is sent to Inventory Submissions for review.</p>
            <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-2">Personal info <Divider /> Family <Divider /> 5 mins</p>
            <button onClick={() => setView('profile')} className={btnCls(profileDone, false)}>{profileDone ? 'View / Update Profile' : 'Fill Up Profile →'}</button>
          </div>

          {/* Exam Cards */}
          {Object.keys(exams).map((key, idx) => {
            const ex = exams[key]
            const done = isDone(key)
            const locked = !profileDone
            return (
              <div key={key} className={cardCls(done) + (locked ? ' opacity-60' : '')}>
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] transition-colors ' + (done ? 'bg-green-600 text-white' : 'bg-[#E8F5F1] text-[#085041] group-hover:bg-[#085041] group-hover:text-white')}>{done ? '✓' : idx + 2}</div>
                <p className="text-[15px] font-bold text-gray-900 mt-4">{ex.title} {done && <DoneBadge />}</p>
                <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed flex-1">{ex.desc}</p>
                <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-2">10 items <Divider /> 5-10 mins {locked && <><Divider /><span>Complete Student Profile first</span></>}</p>
                <button disabled={locked} onClick={() => setView(key)} className={btnCls(done, locked)}>{locked ? 'Locked — Fill Profile First' : done ? 'Retake Exam' : 'Start Exam →'}</button>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-fit">
          <p className="text-[12px] font-bold text-gray-900">Why is this required?</p>
          <div className="mt-4 space-y-3">
            {[
              'Student Profile — so your counselor knows who you are',
              'Personality + Well-Being — only 10 minutes each',
              'Then you can book counseling instantly',
            ].map((t, i) => (
              <div key={i} className="flex gap-2.5"><span className="w-6 h-6 shrink-0 rounded-full bg-[#E8F5F1] flex items-center justify-center text-[10px] font-bold text-[#085041]">{i + 1}</span><p className="text-[11px] text-gray-600 flex-1 leading-relaxed">{t}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}