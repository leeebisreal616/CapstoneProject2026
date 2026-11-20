import { useState, useEffect, useCallback } from 'react'
const BASE = 'https://cheerful-magenta-fly-38.hostingersite.com/api'

const formatCourse = (course, year) => {
  const c = (course || '').trim()
  const y = String(year || '').trim()
  if (!y) return c || 'Not specified'
  if (c.toLowerCase().includes(y.toLowerCase())) return c
  return `${c} ${y}`.trim()
}
const formatTime = (t) => {
  const s = String(t || '').trim()
  if (!s || s === '00:00:00' || s === '00:00' || s === 'To be assigned') return ''
  if (s.includes('AM') || s.includes('PM')) return s
  const parts = s.split(':')
  let h = parseInt(parts[0], 10)
  const m = parts[1] || '00'
  if (isNaN(h)) return s
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}
const formatSchedule = (date, time) => {
  const d = String(date || '').trim()
  const t = formatTime(time)
  const hasDate = d && d !== 'To be assigned' && d !== '0000-00-00' && d !== 'Invalid Date'
  if (hasDate && t) return `${d} at ${t}`
  if (hasDate) return d
  if (t) return t
  return 'To be assigned'
}
function Badge({ status }) {
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    Completed: 'bg-gray-100 text-gray-600 border-gray-200',
    Declined: 'bg-red-50 text-red-700 border-red-200',
    Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${map[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>{status}</span>
}
function UrgencyBadge({ urgency }) {
  const u = (urgency || 'Routine').trim()
  const map = {
    Crisis: 'bg-red-600 text-white border-red-600',
    Urgent: 'bg-orange-50 text-orange-700 border-orange-200',
    Routine: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
  }
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${map[u] || map.Routine}`}>{u}</span>
}
const Icon = {
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}
function ConfirmArchiveModal({ title, message, confirmLabel, isRestore, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl">
        <p className="text-[16px] font-bold text-gray-900">{title}</p>
        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="flex-1 border border-gray-200 rounded-full py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 text-white rounded-full py-2.5 text-[13px] font-bold ${isRestore ? 'bg-[#085041] hover:bg-[#06382D]' : 'bg-gray-900 hover:bg-black'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const [urgencyFilter, setUrgencyFilter] = useState('All')
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [pageError, setPageError] = useState('')
  const fetchLive = useCallback(async (archived = false) => {
    setLoading(true)
    setPageError('')
    try {
      const res = await fetch(`${BASE}/appointments/get_appointments.php?archived=${archived ? 1 : 0}`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.data || data.appointments || []
      const normalized = list.map((a) => {
        const statusRaw = a.status || 'Pending'
        const normalizedStatus = statusRaw.toLowerCase() === 'approved' ? 'Approved' : statusRaw.toLowerCase() === 'declined' ? 'Declined' : statusRaw.toLowerCase() === 'completed' ? 'Completed' : statusRaw.toLowerCase() === 'cancelled' ? 'Cancelled' : 'Pending'
        const urgencyRaw = (a.urgency_level || a.urgency || a.priority || 'Routine').trim()
        const low = urgencyRaw.toLowerCase()
        const urgency = low.includes('crisis') ? 'Crisis' : low.includes('urgent') ? 'Urgent' : 'Routine'
        const parts = String(a.student_info || '').split(' - ')
        const namePart = parts[0] || a.student_name || a.name || `Student ${a.student_id || ''}`
        const rawDate = a.appointment_date
        let prettyDate = a.date || ''
        if (rawDate && rawDate !== 'To be assigned' && rawDate !== '0000-00-00' && rawDate !== '0000-00-00 00:00:00') {
          const dObj = new Date(rawDate)
          prettyDate = isNaN(dObj.getTime()) ? 'To be assigned' : dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        } else {
          prettyDate = 'To be assigned'
        }
        return {
          id: a.id,
          name: namePart,
          studentId: a.student_id || parts[1] || '',
          course: parts[2] || a.course || '',
          year: a.year || a.year_level || '',
          reason: a.reason || a.description || a.details || '',
          date: prettyDate,
          time: a.consultation_hour || a.appointment_time || a.time || '',
          counselor: a.counselor_name || '',
          status: normalizedStatus,
          urgency,
          emergency_contact_name: a.emergency_contact_name || '',
          emergency_contact_relation: a.emergency_contact_relation || '',
          emergency_contact_no: a.emergency_contact_no || '',
        }
      })
      normalized.sort((a, b) => {
        const rank = (u) => u === 'Crisis' ? 0 : u === 'Urgent' ? 1 : 2
        return rank(a.urgency) - rank(b.urgency)
      })
      setAppointments(normalized)
    } catch (e) { setAppointments([]); setPageError('Unable to connect to the server. Please try again later.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchLive(showArchived) }, [showArchived, fetchLive])
  const handleToggleArchived = (val) => { setShowArchived(val); setSelected(null) }
  const handleArchive = (id, mode) => {
    const target = appointments.find(a => String(a.id) === String(id))
    if (!target) return setSelected(null)
    setArchiveTarget({ ...target, mode })
  }
  const confirmArchive = async () => {
    if (!archiveTarget) return
    const { id, mode } = archiveTarget
    try {
      const res = await fetch(`${BASE}/appointments/archive_appointment.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, appointment_id: id, action: mode }) })
      const data = await res.json()
      if (data.success === false) throw new Error(data.message || 'Unable to complete this action. Please try again.')
      setArchiveTarget(null); setSelected(null); fetchLive(showArchived)
    } catch (e) { setArchiveTarget(null); setPageError('Unable to update the appointment. Please try again.') }
  }
  const applyStatusChange = async () => {
    if (!confirmAction) return
    try {
      const res = await fetch(`${BASE}/appointments/update_status.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointment_id: confirmAction.id, id: confirmAction.id, status: confirmAction.action }) })
      const data = await res.json()
      if (data.success === false) throw new Error(data.message || 'Unable to update the status. Please try again.')
      setConfirmAction(null); setSelected(null); fetchLive(showArchived)
    } catch (err) { setConfirmAction(null); setPageError('Unable to update the status. Please try again.') }
  }
  const filtered = appointments.filter(a => {
    const matchStatus = filter === 'all' || a.status === filter
    const matchSearch = (a.name + ' ' + a.studentId).toLowerCase().includes(search.toLowerCase())
    const matchUrgency = urgencyFilter === 'All' || a.urgency === urgencyFilter
    return matchStatus && matchSearch && matchUrgency
  })
  const stats = { total: appointments.length, pending: appointments.filter(a => a.status === 'Pending').length }
  const crisisTotal = appointments.filter(a => a.urgency === 'Crisis').length
  const urgentTotal = appointments.filter(a => a.urgency === 'Urgent').length
  const filteredActive = filtered.filter(a => a.status !== 'Completed').length
  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading appointments...</div>
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">Appointments</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">{showArchived ? `${appointments.length} archived` : `${filteredActive} active — ${stats.pending} pending`}</p>
        </div>
        <button onClick={() => fetchLive(showArchived)} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Total</p><p className="text-[24px] font-extrabold text-gray-900 leading-none mt-1">{stats.total}</p><p className="text-[11px] text-gray-400 mt-1.5">{showArchived ? 'Archived' : 'Active bookings'}</p></div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Pending</p><p className="text-[24px] font-extrabold text-amber-600 leading-none mt-1">{stats.pending}</p><p className="text-[11px] text-gray-400 mt-1.5">Awaiting review</p></div>
        <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold tracking-wider text-red-500 uppercase">Crisis</p><p className="text-[24px] font-extrabold text-red-600 leading-none mt-1">{crisisTotal}</p><p className="text-[11px] text-red-400 mt-1.5">Requires immediate attention</p></div>
      </div>
      {pageError && <div className="bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium px-4 py-2.5 rounded-[14px]">{pageError} <button onClick={() => setPageError('')} className="ml-2 font-bold underline">Dismiss</button></div>}
      <div className="bg-white border border-gray-100 rounded-[20px] p-4 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-100 rounded-full p-1">
            <button onClick={() => handleToggleArchived(false)} className={`text-[12px] font-semibold px-4 py-1.5 rounded-full transition ${!showArchived ? 'bg-white text-[#085041] shadow-sm' : 'text-gray-500'}`}>Active</button>
            <button onClick={() => handleToggleArchived(true)} className={`text-[12px] font-semibold px-4 py-1.5 rounded-full transition ${showArchived ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500'}`}>Archived</button>
          </div>
          <span className="hidden sm:block w-px h-5 bg-gray-200 mx-1" />
          <div className="flex flex-wrap gap-1.5">
            {['all', 'Pending', 'Approved', 'Completed'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition ${filter === f ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>{f === 'all' ? `All (${appointments.length})` : f}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3.5 pr-2 py-1.5 w-full sm:w-[220px]">
            {Icon.search('w-3.5 h-3.5 text-gray-400 shrink-0')}
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or student number" className="bg-transparent text-[12px] w-full outline-none placeholder:text-gray-400" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mr-1">Priority Level</span>
          {['All', 'Crisis', 'Urgent', 'Routine'].map((u) => (
            <button key={u} onClick={() => setUrgencyFilter(u)} className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${urgencyFilter === u ? (u === 'Crisis' ? 'bg-red-600 text-white border-red-600' : u === 'Urgent' ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#085041] text-white border-[#085041]') : 'bg-white text-gray-600 border-gray-200'}`}>{u === 'All' ? 'All Priorities' : u === 'Crisis' ? `Crisis (${crisisTotal})` : u === 'Urgent' ? `Urgent (${urgentTotal})` : 'Routine'}</button>
          ))}
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-gray-100 bg-gray-50/70">{['Student', 'Course', 'Schedule', 'Priority', 'Status', ''].map((h) => (<th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>))}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center"><p className="text-[13px] font-medium text-gray-500">{showArchived ? 'No archived appointments.' : 'No appointments found.'}</p><p className="text-[12px] text-gray-400 mt-1">New requests will appear here once submitted.</p></td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className={`hover:bg-gray-50/70 transition-colors ${a.urgency === 'Crisis' ? 'bg-red-50/60' : a.urgency === 'Urgent' ? 'bg-orange-50/40' : ''}`}>
                    <td className="px-4 py-3.5"><p className="text-[13px] font-semibold text-gray-900">{a.name}</p><p className="text-[11px] text-gray-500">{a.studentId}</p></td>
                    <td className="px-4 py-3.5 text-[12px] text-gray-700">{formatCourse(a.course, a.year)}</td>
                    <td className="px-4 py-3.5 text-[11.5px] text-gray-600 whitespace-nowrap">{formatSchedule(a.date, a.time)}</td>
                    <td className="px-4 py-3.5"><UrgencyBadge urgency={a.urgency} /></td>
                    <td className="px-4 py-3.5"><Badge status={a.status} /></td>
                    <td className="px-4 py-3.5 text-right"><div className="flex gap-1.5 justify-end"><button onClick={() => setSelected(a)} className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50">View</button>{!showArchived ? (<button onClick={() => handleArchive(a.id, 'archive')} className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">Archive</button>) : (<button onClick={() => handleArchive(a.id, 'restore')} className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[#085041] text-[#085041] hover:bg-[#E1F5EE]">Restore</button>)}</div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selected && !confirmAction && !archiveTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-5"><div><p className="text-[16px] font-bold tracking-tight">Appointment Details</p><p className="text-[12px] text-gray-400 mt-0.5">{selected.name} — {selected.studentId}</p></div><button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">{Icon.x('w-3.5 h-3.5')}</button></div>
            <div className="space-y-3 text-[13px]">
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between"><span className="text-gray-400 text-[12px]">Course</span><span className="font-medium">{formatCourse(selected.course, selected.year)}</span></div>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between"><span className="text-gray-400 text-[12px]">Schedule</span><span className="font-medium text-right">{formatSchedule(selected.date, selected.time)}</span></div>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center"><span className="text-gray-400 text-[12px]">Counselor</span><span className="font-medium">{selected.counselor || 'To be assigned'}</span></div>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center"><span className="text-gray-400 text-[12px]">Priority Level</span><UrgencyBadge urgency={selected.urgency} /></div>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center"><span className="text-gray-400 text-[12px]">Status</span><Badge status={selected.status} /></div>
              {selected.reason && <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-[12px] mb-1">Presenting Concern</p><p className="text-gray-700 leading-relaxed">{selected.reason}</p></div>}
              {(selected.emergency_contact_name || selected.emergency_contact_no) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-700 text-[12px] font-bold">Emergency Contact</p>
                  <p className="text-gray-700 text-[12px] mt-1 leading-relaxed">
                    {selected.emergency_contact_name || 'Not provided'} {selected.emergency_contact_relation ? ` — ${selected.emergency_contact_relation}` : ''} {selected.emergency_contact_no ? <><br />Contact Number: {selected.emergency_contact_no}</> : ''}
                  </p>
                </div>
              )}
              {selected.urgency === 'Crisis' && (<p className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-[11.5px] font-medium leading-relaxed">Crisis case. Please prioritize this request. If the student is in immediate danger, please advise them to contact the NCMH Crisis Hotline at 1553 or call 911.</p>)}
            </div>
            {selected.status === 'Pending' && !showArchived && (<div className="flex gap-2 mt-5"><button onClick={() => setConfirmAction({ id: selected.id, action: 'Approved' })} className="flex-1 bg-[#085041] text-white text-[13px] font-semibold py-2.5 rounded-full hover:bg-[#06382D]">Approve</button><button onClick={() => setConfirmAction({ id: selected.id, action: 'Declined' })} className="flex-1 border border-gray-200 text-[13px] font-medium py-2.5 rounded-full hover:bg-gray-50">Decline</button></div>)}
            <div className="mt-3">{!showArchived ? (<button onClick={() => handleArchive(selected.id, 'archive')} className="w-full border border-gray-200 text-gray-500 text-[12.5px] font-medium py-2.5 rounded-full hover:bg-gray-50">Archive this appointment</button>) : (<button onClick={() => handleArchive(selected.id, 'restore')} className="w-full bg-[#085041] text-white text-[12.5px] font-semibold py-2.5 rounded-full">Restore to Active</button>)}</div>
          </div>
        </div>
      )}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"><div className="bg-white rounded-[20px] p-6 w-full max-w-sm text-center shadow-2xl"><p className="text-[15px] font-bold">{confirmAction.action} this appointment?</p><p className="text-[12px] text-gray-400 mt-1">The student will be notified of your decision.</p><div className="flex gap-2 mt-5"><button onClick={() => setConfirmAction(null)} className="flex-1 border border-gray-200 py-2.5 rounded-full text-[13px] font-medium">Cancel</button><button onClick={applyStatusChange} className="flex-1 bg-[#085041] text-white py-2.5 rounded-full text-[13px] font-semibold">Confirm</button></div></div></div>
      )}
      {archiveTarget && (
        <ConfirmArchiveModal title={archiveTarget.mode === 'restore' ? 'Restore Appointment?' : 'Archive Appointment?'} message={archiveTarget.mode === 'restore' ? `Restore the appointment for ${archiveTarget.name}? It will return to Active appointments.` : `Archive the appointment for ${archiveTarget.name}? It will be moved to Archived and will no longer appear in active reports.`} confirmLabel={archiveTarget.mode === 'restore' ? 'Restore' : 'Archive'} isRestore={archiveTarget.mode === 'restore'} onCancel={() => setArchiveTarget(null)} onConfirm={confirmArchive} />
      )}
    </div>
  )
}