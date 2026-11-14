import { useState, useEffect, useMemo } from 'react'

const BASE = 'http://localhost/gco-api'

const Icon = {
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chevron: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}

function formatCourse(course, year) {
  let c = (course || 'N/A').replace('4rd', '4th').replace('1rd', '1st').replace('2rd', '2nd').replace('3rd Year', '3rd Year').trim()
  let y = (year || '').replace('4rd', '4th').trim()
  if (!y) return c
  if (c.toLowerCase().includes('year')) return c
  return `${c} - ${y}`
}

function Badge({ status }) {
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    approved: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    Completed: 'bg-gray-100 text-gray-600 border-gray-200',
    Declined: 'bg-red-50 text-red-700 border-red-200',
    'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
    Reviewed: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
  }
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{status}</span>
}

function FlagBadge({ flag }) {
  const map = {
    urgent: { text: 'Needs Attention', cls: 'bg-red-50 text-red-700 border-red-200' },
    watch: { text: 'Monitor', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    normal: { text: 'Normal', cls: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]' },
    none: { text: 'No Assessment', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  }
  const key = (flag || 'none').toLowerCase()
  const f = map[key] || map.none
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${f.cls}`}>{f.text}</span>
}

function StudentDetailModal({ student, appointments, inventory, exams, onClose }) {
  const studentAppointments = appointments.filter(a => String(a.studentId) === String(student.id))
  const studentSubmissions = inventory.filter(s => String(s.studentId) === String(student.id))
  const studentResults = exams.filter(e => String(e.studentId) === String(student.id))
  const totalInteractions = studentAppointments.length + studentSubmissions.length + studentResults.length
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[20px] w-full max-w-lg shadow-2xl my-auto max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#085041] text-[13px] font-bold shrink-0">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-gray-900 truncate">{student.name}</p>
            <p className="text-[12px] text-gray-500">{student.id} • {student.course}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">{Icon.x('w-4 h-4')}</button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-gray-50 rounded-[14px] p-3 text-center"><p className="text-[18px] font-extrabold">{studentAppointments.length}</p><p className="text-[10.5px] text-gray-500">Appointments</p></div>
            <div className="bg-gray-50 rounded-[14px] p-3 text-center"><p className="text-[18px] font-extrabold">{studentSubmissions.length}</p><p className="text-[10.5px] text-gray-500">Forms Submitted</p></div>
            <div className="bg-gray-50 rounded-[14px] p-3 text-center"><p className="text-[18px] font-extrabold">{studentResults.length}</p><p className="text-[10.5px] text-gray-500">Exams Taken</p></div>
          </div>
          {studentAppointments.length > 0 && (
            <div className="mb-5"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Appointments</p>
              <div className="flex flex-col gap-2">{studentAppointments.map(a => (<div key={a.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between"><div><p className="text-[12.5px] font-medium">{a.concern}</p><p className="text-[11px] text-gray-500">{a.date}</p></div><Badge status={a.status} /></div>))}</div>
            </div>
          )}
          {studentSubmissions.length > 0 && (
            <div className="mb-5"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Inventory Submissions</p>
              <div className="flex flex-col gap-2">{studentSubmissions.map(s => (<div key={s.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between"><div><p className="text-[12.5px] font-medium">{s.type}</p><p className="text-[11px] text-gray-500">{s.date}</p></div><Badge status={s.status} /></div>))}</div>
            </div>
          )}
          {studentResults.length > 0 && (
            <div className="mb-2"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assessment Results</p>
              <div className="flex flex-col gap-2">{studentResults.map(e => (<div key={e.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between"><div><p className="text-[12.5px] font-medium">{e.exam}: {e.result}</p><p className="text-[11px] text-gray-500">{e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p></div><FlagBadge flag={e.flag} /></div>))}</div>
            </div>
          )}
          {totalInteractions === 0 && <p className="text-center text-[13px] text-gray-400 py-6">No recorded portal activity yet for this student.</p>}
        </div>
      </div>
    </div>
  )
}

export default function StudentsDirectory() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [appointments, setAppointments] = useState([])
  const [inventory, setInventory] = useState([])
  const [exams, setExams] = useState([])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Needs Attention' },
    { key: 'watch', label: 'Monitor' },
    { key: 'normal', label: 'Normal' },
  ]

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [appRes, needsRes, profileRes, assessRes, studentsRes] = await Promise.all([
        fetch(`${BASE}/appointments/get_appointments.php?all=1`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/needs_assessment/get_needs_assessment.php`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/student_profile/get_student_profile.php`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/assessment_results/get_results.php?all=1`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/students/get_students.php?all=1`).then(r => r.json()).catch(() => []),
      ])
      const appData = Array.isArray(appRes) ? appRes : appRes.data || []
      const needsData = Array.isArray(needsRes) ? needsRes : needsRes.submissions || needsRes.data || []
      const profileData = Array.isArray(profileRes) ? profileRes : profileRes.submissions || profileRes.data || []
      const assessData = Array.isArray(assessRes) ? assessRes : assessRes.data || []
      const studentsData = Array.isArray(studentsRes) ? studentsRes : studentsRes.data || studentsRes.students || []

      const normApps = appData.map(r => ({ id: r.id, studentId: r.student_id || r.studentId, concern: r.concern || r.reason || r.purpose || 'Counseling', date: r.appointment_date || r.created_at || r.date, status: r.status }))
      const normNeeds = needsData.map(r => ({ id: `needs-${r.id || r.submission_id}`, studentId: r.student_id || r.studentId, type: 'Needs Assessment', date: r.created_at || r.date || r.date_submitted, status: r.status || 'Pending Review' }))
      const normProfiles = profileData.map(r => ({ id: `profile-${r.id || r.profile_id}`, studentId: r.student_id || r.studentId, type: 'Student Profile', date: r.created_at || r.date || r.date_submitted, status: r.status || 'Pending Review' }))
      const normExams = assessData.map(r => {
        const score = Number(r.score) || 0
        const pct = Math.round((score / 40) * 100)
        const label = r.result_label || r.result || r.interpretation || ''
        const flagRaw = (r.flag_level || r.flag || r.status || 'Normal').toLowerCase()
        const flag = flagRaw.includes('monitor') || flagRaw.includes('watch') || flagRaw.includes('moderate') ? 'watch' : flagRaw.includes('high') || flagRaw.includes('urgent') || flagRaw.includes('attention') ? 'urgent' : 'normal'
        return { id: r.result_id || r.id, studentId: String(r.student_id || r.studentId), exam: r.exam_type || r.exam || 'Assessment', result: label ? `${pct}% - ${label}` : `${pct}%`, score, pct, label, flag, date: r.date_taken || r.created_at || r.date || r.submitted_at }
      })
      setAppointments(normApps)
      setInventory([...normNeeds, ...normProfiles])
      setExams(normExams)

      const studentMap = new Map()
      const addToMap = (sid, name, course, year) => {
        if (!sid) return
        const id = String(sid)
        if (!studentMap.has(id)) {
          studentMap.set(id, { id, name: name || `Student ${id}`, course: formatCourse(course, year) })
        } else if (name && studentMap.get(id).name.startsWith('Student ')) {
          studentMap.get(id).name = name
        }
      }
      studentsData.forEach(r => {
        const full = `${r.first_name || r.firstname || ''} ${r.last_name || r.lastname || ''}`.trim()
        addToMap(r.student_id || r.studentId || r.id, full || r.student_name || r.name, r.course || r.course_year, r.year || r.year_level)
      })
      ;[...appData, ...needsData, ...profileData, ...assessData].forEach(r => {
        addToMap(r.student_id || r.studentId, r.student_name || r.name || r.full_name, r.course || r.course_year || r.courseYear, r.year || r.year_level)
      })
      const finalStudents = Array.from(studentMap.values()).map(s => {
        const sExams = normExams.filter(e => String(e.studentId) === String(s.id)).sort((a, b) => new Date(b.date) - new Date(a.date))
        return { ...s, flag: sExams.length ? sExams[0].flag : 'none', lastExam: sExams.length ? sExams[0] : null }
      })
      setStudents(finalStudents)
    } catch (e) { console.error(e); setStudents([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const stats = useMemo(() => ({
    total: students.length,
    withAppt: students.filter(s => appointments.some(a => String(a.studentId) === String(s.id))).length,
    withExam: students.filter(s => exams.some(e => String(e.studentId) === String(s.id))).length,
    urgent: students.filter(s => s.flag === 'urgent').length,
    watch: students.filter(s => s.flag === 'watch').length,
  }), [students, appointments, exams])

  const filtered = useMemo(() => {
    let list = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
    if (filter === 'urgent') list = list.filter(s => s.flag === 'urgent')
    if (filter === 'watch') list = list.filter(s => s.flag === 'watch')
    if (filter === 'normal') list = list.filter(s => s.flag === 'normal')
    return list
  }, [students, search, filter])

  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading students...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">Students Directory</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">{filtered.length} showing • {students.length} total students • Click a row to see full history</p>
        </div>
        <button onClick={fetchAll} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => setFilter('all')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'all' ? 'ring-2 ring-[#085041]/20 border-[#085041]/30' : ''}`}><p className="text-[24px] font-extrabold text-gray-900 leading-none">{stats.total}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">Total Students</p><p className="text-[11px] text-gray-400 mt-0.5">Unique student ID</p></button>
        <button onClick={() => setFilter('urgent')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'urgent' ? 'ring-2 ring-red-500/20 border-red-300' : ''}`}><p className="text-[24px] font-extrabold text-red-600 leading-none">{stats.urgent}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">Needs Attention</p><p className="text-[11px] text-gray-400 mt-0.5">Review immediately</p></button>
        <button onClick={() => setFilter('watch')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'watch' ? 'ring-2 ring-amber-500/20 border-amber-300' : ''}`}><p className="text-[24px] font-extrabold text-amber-600 leading-none">{stats.watch}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">Monitor</p><p className="text-[11px] text-gray-400 mt-0.5">Requires monitoring</p></button>
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[24px] font-extrabold text-[#085041] leading-none">{stats.withExam}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">Took Assessment</p><p className="text-[11px] text-gray-400 mt-0.5">{stats.withAppt} with appointments</p></div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[20px] p-3.5 flex flex-wrap items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border ${filter === f.key ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>{f.key === 'all' ? `All (${students.length})` : f.label}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3.5 pr-2 py-1.5 w-full sm:w-[260px]">
          {Icon.search('w-3.5 h-3.5 text-gray-400 shrink-0')}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or student no." className="bg-transparent text-[12px] w-full outline-none placeholder:text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <table className="w-full text-left">
          <thead><tr className="border-b border-gray-100 bg-gray-50/70">{['Student', 'Course', 'Flag', ''].map(h => <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (<tr><td colSpan={4} className="px-5 py-12 text-center"><p className="text-[13px] font-semibold text-gray-700">No students found.</p><p className="text-[12px] text-gray-400 mt-1">When a student books an appointment or submits a form, the student will appear here.</p></td></tr>)}
            {filtered.map((s) => (
              <tr key={s.id} onClick={() => setSelected(s)} className={`hover:bg-gray-50/70 cursor-pointer ${s.flag === 'urgent' ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#085041] text-[11px] font-bold shrink-0">{s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="text-[13px] font-semibold text-gray-900 truncate">{s.name}</p><p className="text-[11px] text-gray-500">{s.id}</p></div></div></td>
                <td className="px-4 py-3.5 text-[12.5px] text-gray-700">{s.course}</td>
                <td className="px-4 py-3.5"><FlagBadge flag={s.flag} /></td>
                <td className="px-4 py-3.5 text-right"><span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#085041]">View {Icon.chevron('w-3.5 h-3.5')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 text-center">Live data • Unique student ID • Click a student to see appointments, forms, and exams</p>
      {selected && <StudentDetailModal student={selected} appointments={appointments} inventory={inventory} exams={exams} onClose={() => setSelected(null)} />}
    </div>
  )
}