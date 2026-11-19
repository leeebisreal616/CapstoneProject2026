import { useEffect, useMemo, useState } from 'react'

const API = 'https://cheerful-magenta-fly-38.hostingersite.com/api'

function Icon({ name, className }) {
  const paths = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" /></>,
    doc: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" /></>,
    alert: <><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" /></>,
    users: <><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 1.13a4 4 0 00-3-3.87M17 12a4 4 0 100-8" strokeLinecap="round" strokeLinejoin="round" /></>,
    chevron: <><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></>,
    check: <><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      {paths[name]}
    </svg>
  )
}

function normalizeStatus(v) {
  return String(v || '').toLowerCase().replace(/_/g, ' ').trim()
}

function normalizeFlag(v) {
  const s = String(v || '').toLowerCase()
  if (s.includes('attention') || s.includes('critical') || s.includes('high') || s.includes('severe')) return 'needs-attention'
  if (s.includes('monitor') || s.includes('moderate') || s.includes('watch')) return 'monitor'
  return 'normal'
}

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  return dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 18) return 'Good afternoon'
  return 'Good evening'
}

async function getJSON(url) {
  try {
    const r = await fetch(url)
    if (!r.ok) return []
    const j = await r.json()
    return Array.isArray(j) ? j : (j.data || j.results || [])
  } catch {
    return []
  }
}

function buildNameMap(studentsList) {
  const map = new Map()
  for (const s of studentsList || []) {
    const id = String(s.student_id || s.id || '')
    if (!id) continue
    const full = `${s.first_name || s.firstname || ''} ${s.last_name || s.lastname || ''}`.trim()
    if (full) map.set(id, full)
    else if (s.full_name || s.name) map.set(id, s.full_name || s.name)
  }
  return map
}

function resolveName(row, nameMap) {
  if (!row) return 'Student'
  if (row.student_name) return row.student_name
  if (row.full_name) return row.full_name
  if (row.name && row.name !== String(row.student_id)) return row.name
  const id = String(row.student_id || row.studentId || '')
  if (id && nameMap && nameMap.has(id)) return nameMap.get(id)
  if (id) return `Student ${id}`
  return 'Student'
}

// Join parts with —, skip empty parts so no trailing separator
function joinParts(...parts) {
  return parts.filter(Boolean).join(' — ')
}

export default function Overview({ setView }) {
  const [appointments, setAppointments] = useState([])
  const [inventory, setInventory] = useState([])
  const [results, setResults] = useState([])
  const [studentsList, setStudentsList] = useState([])

  useEffect(() => {
    getJSON(`${API}/appointments/get_appointments.php?all=1`).then(setAppointments)
    getJSON(`${API}/inventory/get_submissions.php?all=1`).then(setInventory)
    getJSON(`${API}/assessment_results/get_results.php?all=1`).then(setResults)
    getJSON(`${API}/students/get_students.php?all=1`).then(setStudentsList)
  }, [])

  const nameMap = useMemo(() => buildNameMap(studentsList), [studentsList])

  const pendingAppointments = useMemo(
    () => appointments.filter(a => normalizeStatus(a.status) === 'pending'),
    [appointments]
  )

  const emergencyPending = useMemo(
    () => appointments.filter(a => {
      const u = normalizeStatus(a.urgency)
      const s = normalizeStatus(a.status)
      return u === 'emergency' && s === 'pending'
    }),
    [appointments]
  )

  const pendingReviews = useMemo(
    () => inventory.filter(i => {
  const s = normalizeStatus(i.status)
  return s === 'pending' || s === 'pending review' || s.includes('pending')
    }),
    [inventory]
  )

  const flagged = useMemo(
    () => results.map(r => ({ ...r, _flag: normalizeFlag(r.flag_level || r.result_label) })).filter(r => r._flag !== 'normal'),
    [results]
  )

  const needsAttention = useMemo(() => flagged.filter(r => r._flag === 'needs-attention'), [flagged])
  const monitor = useMemo(() => flagged.filter(r => r._flag === 'monitor'), [flagged])

  const stats = [
    { label: 'Pending Appointments', value: pendingAppointments.length, sub: `${emergencyPending.length} emergency pending`, icon: 'calendar', tint: 'bg-amber-50 text-amber-600', view: 'appointments' },
    { label: 'Pending Reviews', value: pendingReviews.length, sub: 'Inventory submissions awaiting review', icon: 'doc', tint: 'bg-blue-50 text-blue-600', view: 'inventory' },
    { label: 'Needs Attention', value: needsAttention.length, sub: `${monitor.length} under monitoring`, icon: 'alert', tint: 'bg-red-50 text-red-600', view: 'assessment' },
    { label: 'Total Students', value: studentsList.length, sub: 'Registered in directory', icon: 'users', tint: 'bg-emerald-50 text-emerald-700', view: 'students' },
  ]

  const recentActivity = useMemo(() => {
    const items = []
    for (const a of appointments.slice(0, 5)) {
      items.push({
        key: `a-${a.appointment_id || a.id}`,
        title: `${resolveName(a, nameMap)} booked an appointment`,
        sub: joinParts(a.reason || a.purpose || 'General consultation', formatDate(a.created_at || a.date)),
        badge: normalizeStatus(a.status) === 'pending' ? 'Pending' : 'Reviewed',
        badgeClass: normalizeStatus(a.status) === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
        view: 'appointments',
        date: a.created_at || a.date || a.appointment_date,
      })
    }
    for (const r of results.slice(0, 5)) {
      const flag = normalizeFlag(r.flag_level || r.result_label)
      items.push({
        key: `r-${r.result_id || r.id}`,
        title: `${resolveName(r, nameMap)} completed ${r.exam_type || 'Assessment'}`,
        sub: joinParts(r.result_label || '', formatDate(r.date_taken)),
        badge: flag === 'needs-attention' ? 'Needs Attention' : flag === 'monitor' ? 'Monitor' : 'Normal',
        badgeClass: flag === 'needs-attention' ? 'bg-red-50 text-red-700' : flag === 'monitor' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
        view: 'assessment',
        date: r.date_taken,
      })
    }
    for (const i of inventory.slice(0, 5)) {
      items.push({
        key: `i-${i.submission_id || i.id}`,
        title: `${resolveName(i, nameMap)} submitted an inventory form`,
        sub: formatDate(i.submitted_at || i.created_at),
        badge: 'New',
        badgeClass: 'bg-blue-50 text-blue-700',
        view: 'inventory',
        date: i.submitted_at || i.created_at,
      })
    }
    return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 6)
  }, [appointments, results, inventory, nameMap])

  const focusList = useMemo(() => {
    const out = []
    for (const a of emergencyPending.slice(0, 3)) {
      out.push({
        key: `f-a-${a.appointment_id || a.id}`,
        title: `Review emergency request from ${resolveName(a, nameMap)}`,
        sub: joinParts(a.reason || 'Emergency', formatDate(a.appointment_date || a.date)),
        view: 'appointments'
      })
    }
    for (const r of needsAttention.slice(0, 3)) {
      out.push({
        key: `f-r-${r.result_id || r.id}`,
        title: `Follow up with ${resolveName(r, nameMap)}`,
        sub: joinParts(r.exam_type || 'Assessment', r.result_label || ''),
        view: 'assessment'
      })
    }
    for (const i of pendingReviews.slice(0, 3)) {
      out.push({
        key: `f-i-${i.submission_id || i.id}`,
        title: `Review inventory from ${resolveName(i, nameMap)}`,
        sub: formatDate(i.submitted_at || i.created_at),
        view: 'inventory'
      })
    }
    return out.slice(0, 5)
  }, [emergencyPending, needsAttention, pendingReviews, nameMap])

  const greeting = getGreeting()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-gray-900 tracking-tight">{greeting}, Counselor</h1>
          <p className="text-[13px] text-gray-500 mt-1">Here is what needs your attention today.</p>
        </div>
        <p className="text-[12px] text-gray-400 font-medium">{new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={() => setView?.(s.view)} className="bg-white border border-gray-100 rounded-[20px] p-4 sm:p-5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow">
            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${s.tint}`}><Icon name={s.icon} className="w-5 h-5" /></div>
            <p className="text-[28px] sm:text-[32px] font-bold text-gray-900 leading-none mt-3">{s.value}</p>
            <p className="text-[13px] font-semibold text-gray-900 mt-1.5">{s.label}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Recent Activity</h2>
              <p className="text-[12px] text-gray-500">Latest appointments, assessments, and submissions.</p>
            </div>
            <button onClick={() => setView?.('appointments')} className="text-[12px] font-semibold text-emerald-700 flex items-center gap-1">View all <Icon name="chevron" className="w-3.5 h-3.5" /></button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length === 0 && <p className="px-5 py-8 text-[13px] text-gray-400 text-center">No recent activity yet.</p>}
            {recentActivity.map(it => (
              <button key={it.key} onClick={() => setView?.(it.view)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50/70 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{it.title}</p>
                  <p className="text-[12px] text-gray-500 truncate mt-0.5">{it.sub}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${it.badgeClass}`}>{it.badge}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5">
          <h2 className="text-[15px] font-bold text-gray-900">Today&apos;s Focus</h2>
          <p className="text-[12px] text-gray-500 mb-4">Prioritized items requiring action.</p>
          <div className="space-y-2.5">
            {focusList.length === 0 && <p className="text-[13px] text-gray-400 py-4 text-center">All caught up. No urgent items.</p>}
            {focusList.map((f, idx) => (
              <button key={f.key} onClick={() => setView?.(f.view)} className="w-full flex items-start gap-3 text-left p-3 rounded-[14px] bg-gray-50 hover:bg-gray-100/80 transition-colors">
                <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-700 shrink-0 mt-0.5">{idx + 1}</span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-gray-900 leading-snug">{f.title}</span>
                  <span className="block text-[12px] text-gray-500 mt-0.5">{f.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-[12px] text-gray-500">
            <Icon name="check" className="w-4 h-4 text-emerald-600" />
            <span>{needsAttention.length} needs attention — {monitor.length} under monitoring</span>
          </div>
        </div>
      </div>
    </div>
  )
}