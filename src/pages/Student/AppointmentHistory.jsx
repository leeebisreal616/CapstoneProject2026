import { useState, useEffect, useMemo } from 'react'
const BASE = 'https://cheerful-magenta-fly-38.hostingersite.com/api'

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  Declined: 'bg-red-50 text-red-700 border-red-200',
}

// [FIX] Routine / Urgent / Crisis na - match sa bagong backend
const URGENCY_STYLES = {
  Routine: 'bg-gray-100 text-gray-600 border-gray-200',
  Urgent: 'bg-orange-50 text-orange-700 border-orange-200',
  Crisis: 'bg-red-50 text-red-700 border-red-200',
  // Fallback para sa lumang data
  Normal: 'bg-gray-100 text-gray-600 border-gray-200',
  Emergency: 'bg-red-50 text-red-700 border-red-200',
}
const URGENCY_LABEL = {
  Routine: 'Routine',
  Urgent: '⚠️ Urgent',
  Crisis: '🚨 Crisis',
  Normal: 'Routine',
  Emergency: '🚨 Crisis',
}

const FILTERS = ['All', 'Pending', 'Approved', 'Cancelled']

function getStudent() {
  try {
    const raw = localStorage.getItem('student')
    if (raw) {
      const u = JSON.parse(raw)
      const id = u.student_id || u.studentId || u.id
      if (id) return { name: u.student_name || u.name || '', id: String(id), course: u.course || '' }
    }
    const sid = localStorage.getItem('student_id') || localStorage.getItem('studentId')
    if (sid) return { name: '', id: String(sid), course: '' }
  } catch {}
  return { name: '', id: '', course: '' }
}

function Divider() { return <span className="w-px h-3 bg-gray-300 shrink-0" /> }
const isPending = (s) => s === 'Pending' || s === 'Booked'

export default function AppointmentHistory({ showToast }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState({ msg: '', show: false })
  const [filter, setFilter] = useState('All')
  const student = useMemo(() => getStudent(), [])

  useEffect(() => {
    if (!student.id) { setHistory([]); setLoading(false); return }
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${BASE}/appointments/get_appointments.php?student_id=${student.id}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.data || [])
        // [FIX] Wag na mag-reverse - naka ORDER BY created_at DESC na yung backend, pinakabago na sa taas
        setHistory(list.map(r => ({
          id: r.id,
          reason: r.concern || r.reason || 'No reason provided',
          appointment_date: r.appointment_date || r.date,
          consultation_hour: r.time_slot || r.consultation_hour || '',
          counselor_name: r.counselor_name || '',
          status: r.status || 'Pending',
          urgency_level: r.urgency_level || 'Routine',
        })))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchHistory()
  }, [student.id])

  // [FIX] Gamit na yung bagong cancel_appointment.php, hindi na update_status.php
  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`${BASE}/appointments/cancel_appointment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const result = await res.json()
      if (!res.ok || result.success === false) throw new Error(result.message || 'Failed to cancel')
      setHistory(prev => prev.map(h => h.id === id ? { ...h, status: 'Cancelled' } : h))
      setNotice({ msg: "Appointment cancelled successfully.", show: true })
      showToast?.('Appointment cancelled')
    } catch (err) {
      setNotice({ msg: err.message, show: true })
    }
  }

  const counts = { All: history.length, Pending: 0, Approved: 0, Cancelled: 0 }
  history.forEach(h => {
    if (isPending(h.status)) counts.Pending++
    else if (h.status === 'Approved') counts.Approved++
    else if (h.status === 'Cancelled') counts.Cancelled++
  })
  const filtered = filter === 'All' ? history : history.filter(h => filter === 'Pending' ? isPending(h.status) : h.status === filter)

  if (!student.id && !loading) {
    return (
      <div className="bg-[#f6f8f7] w-full min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-[400px] w-full">
          <p className="text-[15px] font-bold text-gray-900">Please login first</p>
          <p className="text-[13px] text-gray-500 mt-1">You need to login as a student to see your appointment history.</p>
          <a href="/login" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-[#085041] text-white font-bold text-[12px]">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f6f8f7] w-full">
      <div className="bg-[#085041] px-6 md:px-10 py-8">
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[32px] md:text-[36px] font-bold text-white leading-none tracking-tight">Appointment History</h1>
            <p className="text-[13px] text-white/60 mt-3 flex items-center gap-2 flex-wrap">
              {[student.name, student.id, student.course].filter(Boolean).join(' | ')}
            </p>
          </div>
          <div className="flex gap-1.5 p-1 bg-black/20 rounded-full">
            {FILTERS.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`text-[12px] font-semibold px-4 py-1.5 rounded-full transition-all ${filter === t ? 'bg-white text-[#085041] shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                {t} {counts[t] > 0 && <span className="ml-1 opacity-60">({counts[t]})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 md:px-10 py-6 max-w-[760px] mx-auto w-full">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-[120px] animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-[13px] font-medium text-gray-600">No {filter.toLowerCase()} appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              // [FIX] Pag Crisis at "To be assigned" pa, wag mag-new Date - magiging Invalid Date yan
              const isTBA = !item.appointment_date || item.appointment_date === 'To be assigned' || item.appointment_date === '0000-00-00'
              const apptDate = isTBA ? null : new Date(item.appointment_date)
              const isCancelled = item.status === 'Cancelled'
              const urgency = item.urgency_level || 'Routine'
              return (
                <div key={item.id} className={`bg-white rounded-xl border p-4 md:p-5 flex gap-4 transition-all ${isCancelled ? 'border-gray-200 opacity-70' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                  <div className={`w-[64px] h-[64px] rounded-lg flex flex-col items-center justify-center shrink-0 ${isCancelled ? 'bg-gray-100 text-gray-400' : 'bg-[#E1F5EE] text-[#085041]'}`}>
                    {isTBA ? (
                      <span className="text-[10px] font-bold text-center leading-tight px-1">TO BE<br/>ASSIGNED</span>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold uppercase tracking-widest">{apptDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-[20px] font-bold leading-none mt-0.5">{apptDate.getDate()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <p className="text-[13px] font-bold text-gray-900">GCO-{item.id}</p>
                        <Divider />
                        <p className="text-[12px] text-gray-600 truncate">{isTBA ? 'To be assigned' : item.consultation_hour} <span className="mx-1 text-gray-300">|</span> {item.counselor_name || 'To be assigned'}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[isPending(item.status) ? 'Pending' : item.status] || STATUS_STYLES.Pending}`}>{isPending(item.status) ? 'Pending' : item.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${URGENCY_STYLES[urgency] || URGENCY_STYLES.Routine}`}>{URGENCY_LABEL[urgency] || 'Routine'}</span>
                      {urgency === 'Crisis' && <span className="text-[11px] text-red-600 font-medium">Prioritized by GCO</span>}
                    </div>
                    <p className="text-[12px] text-gray-600 mt-2 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">{item.reason || 'No reason provided'}</p>
                    {isPending(item.status) && (
                      <button onClick={() => cancelBooking(item.id)} className="mt-3 text-[11px] font-semibold text-gray-500 hover:text-red-600 transition-colors">Cancel appointment →</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {notice.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-[340px] w-full shadow-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#085041] text-white flex items-center justify-center text-[12px] font-bold">✓</div>
            <p className="text-[13px] text-gray-700 mt-3 leading-relaxed">{notice.msg}</p>
            <button onClick={() => setNotice(n => ({ ...n, show: false }))} className="w-full mt-4 py-2.5 rounded-full bg-[#085041] text-white font-bold text-[12px]">Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}