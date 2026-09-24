import { useState } from 'react'
import { logout } from '../utils/adminAuth'

/* ============ MOCK DATA (placeholder, no backend yet) ============ */
const initialAppointments = [
  { id: 1, name: 'Juan Dela Cruz', studentId: '202311325', course: 'BSIT 3-E', concern: 'Academic', date: '2026-08-20', time: '9:00 AM - 10:00 AM', status: 'Pending' },
  { id: 2, name: 'Maria Santos', studentId: '202211102', course: 'BSED 2-A', concern: 'Personal / Emotional', date: '2026-08-21', time: '1:00 PM - 2:00 PM', status: 'Approved' },
  { id: 3, name: 'Pedro Reyes', studentId: '202411567', course: 'BSCE 1-B', concern: 'Career Guidance', date: '2026-08-19', time: '10:00 AM - 11:00 AM', status: 'Completed' },
  { id: 4, name: 'Ana Lopez', studentId: '202310988', course: 'BSIT 4-C', concern: 'Family / Social', date: '2026-08-22', time: '2:00 PM - 3:00 PM', status: 'Pending' },
]

const inventorySubmissions = [
  { id: 1, name: 'Juan Dela Cruz', studentId: '202311325', type: 'Needs Assessment', date: '2026-08-15', status: 'Reviewed',
    details: { courseYear: 'BSIT 3-E', age: 20, sex: 'Male', academicNeeds: ['Test anxiety or exam preparation', 'Understanding course materials'], socialNeeds: ['Stress or anxiety'], careerNeeds: "Yes, I'm unsure about my course or career path", concern: 'Struggling to balance academic workload with part-time job responsibilities.', wellbeing: '😐 Neutral' } },
  { id: 2, name: 'Maria Santos', studentId: '202211102', type: 'Student Profile', date: '2026-08-16', status: 'Pending Review',
    details: { nickname: 'Mars', dob: '2004-03-12', pob: 'Imus, Cavite', sex: 'Female', civilStatus: 'Single', religion: 'Roman Catholic', address: 'Brgy. Anabu II, Imus, Cavite', contact: '09171234567', college: 'College of Teacher Education', courseYear: 'BSED 2-A', income: '₱10,000 - ₱20,000', siblings: 3, birthOrder: 'Middle', health: 'None' } },
  { id: 3, name: 'Ana Lopez', studentId: '202310988', type: 'Needs Assessment', date: '2026-08-17', status: 'Pending Review',
    details: { courseYear: 'BSIT 4-C', age: 21, sex: 'Female', academicNeeds: ['Attendance and motivation'], socialNeeds: ['Financial difficulties', 'Difficulty adjusting to college life'], careerNeeds: 'Yes, I want help with job/internship readiness', concern: 'Feeling overwhelmed with thesis requirements and financial constraints.', wellbeing: '😟 Poor' } },
]

const examResults = [
  { id: 1, name: 'Juan Dela Cruz', studentId: '202311325', exam: 'Personality', result: 'Balanced Personality', flag: 'normal', date: '2026-08-14' },
  { id: 2, name: 'Maria Santos', studentId: '202211102', exam: 'Well-Being', result: 'Needs Attention', flag: 'urgent', date: '2026-08-15' },
  { id: 3, name: 'Pedro Reyes', studentId: '202411567', exam: 'Well-Being', result: 'Moderate Well-Being', flag: 'watch', date: '2026-08-16' },
  { id: 4, name: 'Ana Lopez', studentId: '202310988', exam: 'Personality', result: 'High Extraversion', flag: 'normal', date: '2026-08-17' },
]

const initialAnnouncements = [
  { id: 1, title: 'No Walk-in Sessions on July 18, 2025', desc: 'The GCO office will be closed for an internal seminar. Online appointment booking remains open.', date: 'July 15, 2025', status: 'Published' },
  { id: 2, title: 'Reminder: Submit Inventory Forms', desc: 'All first-year students are required to complete the Needs Assessment and Student Profile Inventory Form before August 1, 2025.', date: 'July 10, 2025', status: 'Published' },
  { id: 3, title: 'Mental Health Week: July 21 to 25, 2025', desc: 'The GCO invites all students to join our Mental Health Awareness Week activities. Free counseling sessions available all week.', date: 'July 8, 2025', status: 'Published' },
]

/* ============ ICONS ============ */
const Icon = {
  overview: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10m-9 11h4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  appointments: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  inventory: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  assessment: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  modules: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  announcements: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  students: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 1.13a4 4 0 00-3-3.87M17 12a4 4 0 100-8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bell: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronRight: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>,
  menu: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  logout: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

/* ============ STATUS BADGE ============ */
function Badge({ status }) {
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    Completed: 'bg-gray-100 text-gray-600 border-gray-200',
    'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
    Reviewed: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    Published: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    Draft: 'bg-gray-100 text-gray-600 border-gray-200',
    Declined: 'bg-red-50 text-red-700 border-red-200',
  }
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{status}</span>
}

function FlagBadge({ flag }) {
  const map = {
    urgent: { text: 'Needs Attention', cls: 'bg-red-50 text-red-700 border-red-200' },
    watch: { text: 'Monitor', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    normal: { text: 'Normal', cls: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]' },
  }
  const f = map[flag] || map.normal
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${f.cls}`}>{f.text}</span>
}

/* ============ SIDEBAR ============ */
const navItems = [
  { id: 'overview', label: 'Overview', icon: Icon.overview },
  { id: 'appointments', label: 'Appointments', icon: Icon.appointments, count: initialAppointments.filter(a => a.status === 'Pending').length },
  { id: 'inventory', label: 'Inventory Submissions', icon: Icon.inventory, count: inventorySubmissions.filter(i => i.status === 'Pending Review').length },
  { id: 'assessment', label: 'Assessment Results', icon: Icon.assessment, count: examResults.filter(e => e.flag === 'urgent').length },
  { id: 'modules', label: 'Modules', icon: Icon.modules },
  { id: 'announcements', label: 'Announcements', icon: Icon.announcements },
  { id: 'students', label: 'Students Directory', icon: Icon.students },
]

function Sidebar({ view, setView, mobileOpen, setMobileOpen, onLogout }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)}/>
      )}
      <div className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#085041] flex flex-col z-50 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold leading-tight">GCO Admin</p>
            <p className="text-white/50 text-[11px]">CvSU Imus Campus</p>
          </div>
          <button className="ml-auto lg:hidden text-white/70" onClick={() => setMobileOpen(false)}>{Icon.x('w-5 h-5')}</button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider px-3 mb-2">Modules</p>
          <div className="flex flex-col gap-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false) }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${view === item.id ? 'bg-white text-[#085041] font-semibold' : 'text-white/75 hover:bg-white/10'}`}>
                {item.icon('w-[18px] h-[18px] flex-shrink-0')}
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${view === item.id ? 'bg-[#085041] text-white' : 'bg-white/20 text-white'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">JM</div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-[12px] font-semibold truncate">Jervin M.</p>
              <p className="text-white/50 text-[10px] truncate">Guidance Counselor</p>
            </div>
            <button onClick={onLogout} className="text-white/50 hover:text-white flex-shrink-0">{Icon.logout('w-4 h-4')}</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ============ TOPBAR ============ */
function AdminTopbar({ title, subtitle, setMobileOpen }) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-3">
      <button className="lg:hidden text-gray-500" onClick={() => setMobileOpen(true)}>{Icon.menu('w-6 h-6')}</button>
      <div className="min-w-0 flex-1">
        <h1 className="text-[18px] font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-[12.5px] text-gray-500 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}

/* ============ OVERVIEW ============ */
function Overview({ setView }) {
  const pendingAppt = initialAppointments.filter(a => a.status === 'Pending').length
  const pendingInv = inventorySubmissions.filter(i => i.status === 'Pending Review').length
  const flagged = examResults.filter(e => e.flag === 'urgent').length

  const stats = [
    { label: 'Pending Appointments', value: pendingAppt, color: '#085041', view: 'appointments' },
    { label: 'Pending Reviews', value: pendingInv, color: '#185FA5', view: 'inventory' },
    { label: 'Flagged Students', value: flagged, color: '#B91C1C', view: 'assessment' },
    { label: 'Total Students Engaged', value: 4, color: '#3C3489', view: 'students' },
  ]

  const activity = [
    { text: 'Maria Santos submitted the Well-Being exam', flag: true, time: '2 hours ago' },
    { text: 'Juan Dela Cruz booked an appointment for Academic concern', flag: false, time: '5 hours ago' },
    { text: 'Ana Lopez submitted the Needs Assessment Form', flag: false, time: '1 day ago' },
    { text: 'Pedro Reyes completed his Well-Being exam', flag: false, time: '2 days ago' },
  ]

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <button key={i} onClick={() => setView(s.view)} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left hover:border-gray-200 transition-colors">
            <p className="text-[26px] font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[12px] text-gray-500 mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {flagged > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
            {Icon.assessment('w-4 h-4')}
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-semibold text-red-800">{flagged} student{flagged > 1 ? 's' : ''} flagged as "Needs Attention" from Well-Being assessment</p>
            <p className="text-[12px] text-red-600 mt-0.5">Review their results and consider reaching out for a follow-up session.</p>
          </div>
          <button onClick={() => setView('assessment')} className="text-[12px] font-semibold text-red-700 whitespace-nowrap flex-shrink-0">Review →</button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[14px] font-semibold text-gray-900">Recent Activity</p>
          </div>
          <div className="divide-y divide-gray-100">
            {activity.map((a, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.flag ? 'bg-red-500' : 'bg-[#1D9E75]'}`}/>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700 leading-relaxed">{a.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[14px] font-semibold text-gray-900">Upcoming Appointments</p>
          </div>
          <div className="divide-y divide-gray-100">
            {initialAppointments.filter(a => a.status === 'Approved').map(a => (
              <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#085041] text-[11px] font-bold flex-shrink-0">
                  {a.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate">{a.name}</p>
                  <p className="text-[11.5px] text-gray-500">{a.date} - {a.time}</p>
                </div>
              </div>
            ))}
            {initialAppointments.filter(a => a.status === 'Approved').length === 0 && (
              <p className="px-5 py-6 text-[13px] text-gray-400 text-center">No approved appointments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============ APPOINTMENTS ============ */
function Appointments() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { id, action: 'Approved' | 'Declined' }
  const filters = ['all', 'Pending', 'Approved', 'Completed']
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const applyStatusChange = () => {
    if (!confirmAction) return
    setAppointments(prev => prev.map(a => a.id === confirmAction.id ? { ...a, status: confirmAction.action } : a))
    setSelected(null)
    setConfirmAction(null)
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[12.5px] font-semibold px-3.5 py-2 rounded-full whitespace-nowrap border ${filter === f ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Concern</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] text-gray-400">No appointments in this category.</td></tr>
              )}
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-gray-900">{a.name}</p>
                    <p className="text-[11.5px] text-gray-500">{a.studentId} - {a.course}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{a.concern}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{a.date}<br/><span className="text-[11.5px] text-gray-400">{a.time}</span></td>
                  <td className="px-5 py-3.5"><Badge status={a.status}/></td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setSelected(a)} className="text-[12px] font-semibold text-[#0F6E56]">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && !confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[16px] font-bold text-gray-900">Appointment Details</p>
              <button onClick={() => setSelected(null)} className="text-gray-400">{Icon.x('w-5 h-5')}</button>
            </div>
            <div className="flex flex-col gap-3 text-[13px]">
              <div><p className="text-gray-400 text-[11px] font-bold uppercase">Student</p><p className="text-gray-900">{selected.name} ({selected.studentId})</p></div>
              <div><p className="text-gray-400 text-[11px] font-bold uppercase">Course</p><p className="text-gray-900">{selected.course}</p></div>
              <div><p className="text-gray-400 text-[11px] font-bold uppercase">Concern</p><p className="text-gray-900">{selected.concern}</p></div>
              <div><p className="text-gray-400 text-[11px] font-bold uppercase">Schedule</p><p className="text-gray-900">{selected.date} at {selected.time}</p></div>
              <div><p className="text-gray-400 text-[11px] font-bold uppercase">Status</p><Badge status={selected.status}/></div>
            </div>
            {selected.status === 'Pending' && (
              <div className="flex gap-2 mt-5">
                <button onClick={() => setConfirmAction({ id: selected.id, action: 'Approved' })} className="flex-1 bg-[#085041] text-white text-[13px] font-semibold py-2.5 rounded-full">Approve</button>
                <button onClick={() => setConfirmAction({ id: selected.id, action: 'Declined' })} className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-2.5 rounded-full">Decline</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm action modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${confirmAction.action === 'Approved' ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-red-50 text-red-600'}`}>
              {Icon.appointments('w-5 h-5')}
            </div>
            <p className="text-[15px] font-bold text-gray-900 mb-1">
              {confirmAction.action === 'Approved' ? 'Approve this appointment?' : 'Decline this appointment?'}
            </p>
            <p className="text-[13px] text-gray-500 mb-5">
              {confirmAction.action === 'Approved'
                ? 'The student will be notified that their appointment has been confirmed.'
                : 'The student will be notified that their appointment request was declined.'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmAction(null)} className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-2.5 rounded-full">Cancel</button>
              <button onClick={applyStatusChange}
                className={`flex-1 text-white text-[13px] font-semibold py-2.5 rounded-full ${confirmAction.action === 'Approved' ? 'bg-[#085041]' : 'bg-red-600'}`}>
                Yes, {confirmAction.action === 'Approved' ? 'Approve' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============ INVENTORY SUBMISSIONS ============ */
function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="mb-3">
      <p className="text-gray-400 text-[10.5px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 text-[13px] mt-0.5">{Array.isArray(value) ? value.join(', ') : value}</p>
    </div>
  )
}

function InventorySubmissions() {
  const [submissions, setSubmissions] = useState(inventorySubmissions)
  const [selected, setSelected] = useState(null)

  const markReviewed = (id) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'Reviewed' } : s))
    setSelected(prev => prev ? { ...prev, status: 'Reviewed' } : prev)
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Form Type</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-gray-900">{s.name}</p>
                    <p className="text-[11.5px] text-gray-500">{s.studentId}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{s.type}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{s.date}</td>
                  <td className="px-5 py-3.5"><Badge status={s.status}/></td>
                  <td className="px-5 py-3.5 text-right"><button onClick={() => setSelected(s)} className="text-[12px] font-semibold text-[#0F6E56]">View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#f4f9f7] border border-[#d1e5de] rounded-xl p-4 mt-4">
        <p className="text-[12px] text-gray-600 leading-relaxed">
          Form responses contain personal and sensitive information. Access and handling shall comply with the Data Privacy Act of 2012 (RA 10173).
        </p>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 overflow-y-auto py-8" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-auto max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[16px] font-bold text-gray-900">{selected.type}</p>
              <button onClick={() => setSelected(null)} className="text-gray-400 flex-shrink-0">{Icon.x('w-5 h-5')}</button>
            </div>
            <p className="text-[12.5px] text-gray-500 mb-4">{selected.name} ({selected.studentId}) - Submitted {selected.date}</p>

            <div className="border-t border-gray-100 pt-4">
              {selected.type === 'Needs Assessment' ? (
                <>
                  <DetailRow label="Course & Year" value={selected.details.courseYear}/>
                  <DetailRow label="Age" value={selected.details.age}/>
                  <DetailRow label="Sex" value={selected.details.sex}/>
                  <DetailRow label="Academic Needs" value={selected.details.academicNeeds}/>
                  <DetailRow label="Personal-Social-Emotional Needs" value={selected.details.socialNeeds}/>
                  <DetailRow label="Career Guidance Needed" value={selected.details.careerNeeds}/>
                  <DetailRow label="Priority Concern" value={selected.details.concern}/>
                  <DetailRow label="Self-Rated Well-Being" value={selected.details.wellbeing}/>
                </>
              ) : (
                <>
                  <DetailRow label="Nickname" value={selected.details.nickname}/>
                  <DetailRow label="Date of Birth" value={selected.details.dob}/>
                  <DetailRow label="Place of Birth" value={selected.details.pob}/>
                  <DetailRow label="Sex" value={selected.details.sex}/>
                  <DetailRow label="Civil Status" value={selected.details.civilStatus}/>
                  <DetailRow label="Religion" value={selected.details.religion}/>
                  <DetailRow label="Address" value={selected.details.address}/>
                  <DetailRow label="Contact Number" value={selected.details.contact}/>
                  <DetailRow label="College" value={selected.details.college}/>
                  <DetailRow label="Course & Year" value={selected.details.courseYear}/>
                  <DetailRow label="Monthly Family Income" value={selected.details.income}/>
                  <DetailRow label="Number of Siblings" value={selected.details.siblings}/>
                  <DetailRow label="Birth Order" value={selected.details.birthOrder}/>
                  <DetailRow label="Health Condition" value={selected.details.health}/>
                </>
              )}
            </div>

            {selected.status === 'Pending Review' && (
              <button onClick={() => markReviewed(selected.id)} className="bg-[#085041] text-white text-[13px] font-semibold py-3 rounded-full w-full mt-4">
                Mark as Reviewed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============ ASSESSMENT RESULTS ============ */
function AssessmentResults() {
  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Exam</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Flag</th>
                <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {examResults.map(e => (
                <tr key={e.id} className={`hover:bg-gray-50 ${e.flag === 'urgent' ? 'bg-red-50/40' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-gray-900">{e.name}</p>
                    <p className="text-[11.5px] text-gray-500">{e.studentId}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{e.exam}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{e.result}</td>
                  <td className="px-5 py-3.5"><FlagBadge flag={e.flag}/></td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-[#f4f9f7] border border-[#d1e5de] rounded-xl p-4 mt-4">
        <p className="text-[12px] text-gray-600 leading-relaxed">
          Exam results are confidential and shall be handled in accordance with the Data Privacy Act of 2012 (RA 10173). Access is limited to authorized GCO personnel only.
        </p>
      </div>
    </div>
  )
}

/* ============ MODULES MANAGEMENT ============ */
function ModulesManagement() {
  const modCounts = { Academic: 5, 'Personal-Social-Emotional': 5, Career: 5 }
  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {Object.entries(modCounts).map(([cat, count]) => (
          <div key={cat} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[22px] font-bold text-[#085041]">{count}</p>
            <p className="text-[12.5px] text-gray-500 mt-0.5">{cat} Modules</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-[14px] font-semibold text-gray-900 mb-1">Module content editing</p>
        <p className="text-[13px] text-gray-500">Full module editor (add, edit, archive modules) will be available once connected to the database.</p>
      </div>
    </div>
  )
}

/* ============ ANNOUNCEMENTS MANAGEMENT ============ */
function AnnouncementForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [desc, setDesc] = useState(initial?.desc || '')
  const [status, setStatus] = useState(initial?.status || 'Draft')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!title.trim() || !desc.trim()) {
      setError('Title and description are both required.')
      return
    }
    onSave({ title: title.trim(), desc: desc.trim(), status })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[16px] font-bold text-gray-900">{initial ? 'Edit Announcement' : 'New Announcement'}</p>
          <button onClick={onCancel} className="text-gray-400">{Icon.x('w-5 h-5')}</button>
        </div>

        <div className="mb-3.5">
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Office closed on August 5"
            className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-[#1D9E75]"/>
        </div>

        <div className="mb-3.5">
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Details students should know..."
            className="w-full border-[1.5px] border-gray-200 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-[#1D9E75] resize-none"/>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Status</label>
          <div className="flex gap-2">
            {['Draft', 'Published'].map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`flex-1 text-[13px] font-semibold py-2 rounded-full border ${status === s ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-[12.5px] mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-2.5 rounded-full">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-[#085041] text-white text-[13px] font-semibold py-2.5 rounded-full">
            {initial ? 'Save Changes' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AnnouncementsManagement() {
  const [items, setItems] = useState(initialAnnouncements)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (item) => { setEditing(item); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setItems(prev => prev.map(a => a.id === editing.id ? { ...a, ...data } : a))
    } else {
      const newItem = { id: Date.now(), date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), ...data }
      setItems(prev => [newItem, ...prev])
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = () => {
    setItems(prev => prev.filter(a => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <button onClick={openNew} className="bg-[#085041] text-white text-[13px] font-semibold px-4 py-2.5 rounded-full mb-4">+ New Announcement</button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {items.length === 0 && (
          <p className="px-5 py-10 text-center text-[13px] text-gray-400">No announcements yet. Create one to notify students.</p>
        )}
        {items.map(a => (
          <div key={a.id} className="px-5 py-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-gray-900">{a.title}</p>
              <p className="text-[12.5px] text-gray-500 mt-0.5 line-clamp-1">{a.desc}</p>
              <p className="text-[11px] text-gray-400 mt-1">{a.date}</p>
            </div>
            <Badge status={a.status}/>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => openEdit(a)} className="text-[12px] font-semibold text-[#0F6E56]">Edit</button>
              <button onClick={() => setDeleteTarget(a)} className="text-[12px] font-semibold text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {formOpen && <AnnouncementForm initial={editing} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditing(null) }}/>}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 text-red-600">
              {Icon.x('w-5 h-5')}
            </div>
            <p className="text-[15px] font-bold text-gray-900 mb-1">Delete this announcement?</p>
            <p className="text-[13px] text-gray-500 mb-5">"{deleteTarget.title}" will be removed and no longer visible to students.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-2.5 rounded-full">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white text-[13px] font-semibold py-2.5 rounded-full">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============ STUDENTS DIRECTORY ============ */
const studentsData = [
  { name: 'Juan Dela Cruz', id: '202311325', course: 'BSIT 3-E' },
  { name: 'Maria Santos', id: '202211102', course: 'BSED 2-A' },
  { name: 'Pedro Reyes', id: '202411567', course: 'BSCE 1-B' },
  { name: 'Ana Lopez', id: '202310988', course: 'BSIT 4-C' },
]

function StudentDetailModal({ student, onClose }) {
  const studentAppointments = initialAppointments.filter(a => a.studentId === student.id)
  const studentSubmissions = inventorySubmissions.filter(s => s.studentId === student.id)
  const studentResults = examResults.filter(e => e.studentId === student.id)
  const totalInteractions = studentAppointments.length + studentSubmissions.length + studentResults.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 overflow-y-auto py-8" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#085041] text-[13px] font-bold flex-shrink-0">
            {student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-gray-900">{student.name}</p>
            <p className="text-[12.5px] text-gray-500">{student.id} - {student.course}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 flex-shrink-0">{Icon.x('w-5 h-5')}</button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[18px] font-bold text-gray-900">{studentAppointments.length}</p>
              <p className="text-[10.5px] text-gray-500 mt-0.5">Appointments</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[18px] font-bold text-gray-900">{studentSubmissions.length}</p>
              <p className="text-[10.5px] text-gray-500 mt-0.5">Forms Submitted</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[18px] font-bold text-gray-900">{studentResults.length}</p>
              <p className="text-[10.5px] text-gray-500 mt-0.5">Exams Taken</p>
            </div>
          </div>

          {studentAppointments.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Appointments</p>
              <div className="flex flex-col gap-2">
                {studentAppointments.map(a => (
                  <div key={a.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                    <div><p className="text-[12.5px] font-medium text-gray-900">{a.concern}</p><p className="text-[11px] text-gray-500">{a.date}</p></div>
                    <Badge status={a.status}/>
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
                    <div><p className="text-[12.5px] font-medium text-gray-900">{s.type}</p><p className="text-[11px] text-gray-500">{s.date}</p></div>
                    <Badge status={s.status}/>
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
                    <div><p className="text-[12.5px] font-medium text-gray-900">{e.exam}: {e.result}</p><p className="text-[11px] text-gray-500">{e.date}</p></div>
                    <FlagBadge flag={e.flag}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalInteractions === 0 && (
            <p className="text-center text-[13px] text-gray-400 py-6">No recorded portal activity yet for this student.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StudentsDirectory() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const students = studentsData.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-4 py-2.5 mb-4 max-w-sm">
        {Icon.search('w-4 h-4 text-gray-400')}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="text-[13.5px] w-full outline-none"/>
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
            {students.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-[13px] text-gray-400">No students found.</td></tr>
            )}
            {students.map((s, i) => (
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

      {selected && <StudentDetailModal student={selected} onClose={() => setSelected(null)}/>}
    </div>
  )
}

/* ============ MAIN ADMIN DASHBOARD ============ */
const titles = {
  overview: ['Overview', 'Welcome back, here is what is happening today.'],
  appointments: ['Appointments', 'Manage counseling appointment requests.'],
  inventory: ['Inventory Submissions', 'Review submitted Needs Assessment and Student Profile forms.'],
  assessment: ['Assessment Results', 'View student profiling exam results.'],
  modules: ['Modules', 'Manage guidance and counseling content modules.'],
  announcements: ['Announcements', 'Manage announcements shown to students.'],
  students: ['Students Directory', 'Browse students who have used the portal.'],
}

export default function AdminDashboard({ onLogout }) {
  const [view, setView] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    onLogout?.()
  }

  const views = {
    overview: <Overview setView={setView}/>,
    appointments: <Appointments/>,
    inventory: <InventorySubmissions/>,
    assessment: <AssessmentResults/>,
    modules: <ModulesManagement/>,
    announcements: <AnnouncementsManagement/>,
    students: <StudentsDirectory/>,
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={handleLogout}/>
      <div className="flex-1 min-w-0">
        <AdminTopbar title={titles[view][0]} subtitle={titles[view][1]} setMobileOpen={setMobileOpen}/>
        {views[view]}
      </div>
    </div>
  )
}