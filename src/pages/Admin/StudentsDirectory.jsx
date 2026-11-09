/* ============ STUDENTS DIRECTORY - LIVE MYSQL, NO DUMMY, SAME DESIGN ============ */
import { useState, useEffect } from 'react'

const BASE = 'http://localhost/gco-api'

const Icon = {
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
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
  }
  const key = (flag || 'normal').toLowerCase()
  const f = map[key] || map.normal
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${f.cls}`}>{f.text}</span>
}

function StudentDetailModal({ student, appointments, inventory, exams, onClose }) {
  const studentAppointments = appointments.filter(a => a.studentId === student.id)
  const studentSubmissions = inventory.filter(s => s.studentId === student.id)
  const studentResults = exams.filter(e => e.studentId === student.id)
  const totalInteractions = studentAppointments.length + studentSubmissions.length + studentResults.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 overflow-y-auto py-8" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#085041] text-[13px] font-bold flex-shrink-0">
            {student.name.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-gray-900">{student.name}</p>
            <p className="text-[12.5px] text-gray-500">{student.id} - {student.course}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 flex-shrink-0">{Icon.x('w-5 h-5')}</button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-[18px] font-bold">{studentAppointments.length}</p><p className="text-[10.5px] text-gray-500">Appointments</p></div>
            <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-[18px] font-bold">{studentSubmissions.length}</p><p className="text-[10.5px] text-gray-500">Forms Submitted</p></div>
            <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-[18px] font-bold">{studentResults.length}</p><p className="text-[10.5px] text-gray-500">Exams Taken</p></div>
          </div>

          {studentAppointments.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Appointments</p>
              <div className="flex flex-col gap-2">
                {studentAppointments.map(a => (
                  <div key={a.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                    <div><p className="text-[12.5px] font-medium">{a.concern}</p><p className="text-[11px] text-gray-500">{a.date}</p></div><Badge status={a.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}
          {studentSubmissions.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Inventory Submissions</p>
              <div className="flex flex-col gap-2">
                {studentSubmissions.map(s => (
                  <div key={s.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                    <div><p className="text-[12.5px] font-medium">{s.type}</p><p className="text-[11px] text-gray-500">{s.date}</p></div><Badge status={s.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}
          {studentResults.length > 0 && (
            <div className="mb-2">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Assessment Results</p>
              <div className="flex flex-col gap-2">
                {studentResults.map(e => (
                  <div key={e.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                    <div><p className="text-[12.5px] font-medium">{e.exam}: {e.result}</p><p className="text-[11px] text-gray-500">{e.date}</p></div><FlagBadge flag={e.flag}/>
                  </div>
                ))}
              </div>
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
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const [students, setStudents] = useState([])
  const [appointments, setAppointments] = useState([])
  const [inventory, setInventory] = useState([])
  const [exams, setExams] = useState([])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [appRes, needsRes, profileRes, assessRes] = await Promise.all([
        fetch(`${BASE}/appointments/get_appointments.php`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/needs_assessment/get_needs_assessment.php`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/student_profile/get_student_profile.php`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/assessment_results/get_results.php`).then(r => r.json()).catch(() => []),
      ])

      const appData = Array.isArray(appRes) ? appRes : appRes.data || []
      const needsData = Array.isArray(needsRes) ? needsRes : needsRes.data || []
      const profileData = Array.isArray(profileRes) ? profileRes : profileRes.data || []
      const assessData = Array.isArray(assessRes) ? assessRes : assessRes.data || []

      // Normalize for directory
      const normApps = appData.map(r => ({
        id: r.id,
        studentId: r.student_id || r.studentId,
        concern: r.concern || r.reason || r.purpose || 'Counseling',
        date: r.appointment_date || r.created_at || r.date,
        status: r.status,
      }))
      const normNeeds = needsData.map(r => ({
        id: `needs-${r.id}`,
        studentId: r.student_id || r.studentId,
        type: 'Needs Assessment',
        date: r.created_at || r.date,
        status: r.status || 'Pending Review',
      }))
      const normProfiles = profileData.map(r => ({
        id: `profile-${r.id}`,
        studentId: r.student_id || r.studentId,
        type: 'Student Profile',
        date: r.created_at || r.date,
        status: r.status || 'Pending Review',
      }))
      const normExams = assessData.map(r => ({
        id: r.id,
        studentId: r.student_id || r.studentId,
        exam: r.exam_type || r.exam || 'Assessment',
        result: r.result || r.score || r.interpretation,
        flag: r.flag || r.status || 'normal',
        date: r.created_at || r.date,
      }))

      setAppointments(normApps)
      setInventory([...normNeeds, ...normProfiles])
      setExams(normExams)

      // BUILD STUDENTS LIST FROM ALL TABLES - WALANG DUMMY!
      const studentMap = new Map()
      const addToMap = (sid, name, course) => {
        if (!sid) return
        if (!studentMap.has(sid)) {
          studentMap.set(sid, {
            id: sid,
            name: name || `Student ${sid}`,
            course: course || 'N/A',
          })
        }
      }

      ;[...appData, ...needsData, ...profileData, ...assessData].forEach(r => {
        addToMap(r.student_id || r.studentId, r.student_name || r.name || r.full_name, r.course || r.course_year || r.courseYear)
      })

      setStudents(Array.from(studentMap.values()))
    } catch (e) {
      console.error(e)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return <div className="p-10 text-center text-[13px] text-gray-400">Loading students from MySQL (appointments + needs + profile + assessment)...</div>
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-4 py-2.5 max-w-sm flex-1">
          {Icon.search('w-4 h-4 text-gray-400')}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="text-[13.5px] w-full outline-none"/>
        </div>
        <button onClick={fetchAll} className="ml-2 text-[11px] px-3 py-1.5 bg-white border rounded-full">Refresh</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
              <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-[13px] text-gray-400">No students found. Empty pa MySQL mo boss - pag nag-book / nag-submit student, dito lalabas!</td></tr>
            )}
            {filtered.map((s, i) => (
              <tr key={i} onClick={() => setSelected(s)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">{s.name}</td>
                <td className="px-5 py-3.5 text-[13px] text-gray-700">{s.id}</td>
                <td className="px-5 py-3.5 text-[13px] text-gray-700">{s.course}</td>
                <td className="px-5 py-3.5 text-right text-[12px] font-semibold text-[#0F6E56]">View →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#f4f9f7] border border-[#d1e5de] rounded-xl p-4 mt-4">
        <p className="text-[11px] text-gray-600">✅ LIVE from: <code>get_appointments.php</code> + <code>get_needs_assessment.php</code> + <code>get_student_profile.php</code> + <code>get_results.php</code>. Walang dummy - unique student_id ang pinapakita!</p>
      </div>

      {selected && <StudentDetailModal student={selected} appointments={appointments} inventory={inventory} exams={exams} onClose={() => setSelected(null)}/>}
    </div>
  )
}