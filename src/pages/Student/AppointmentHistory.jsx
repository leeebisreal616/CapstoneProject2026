import { useState, useEffect } from 'react'
const BASE = 'http://localhost/gco-api'
// LIVE: https://gco-api.infinityfreeapp.com
const MOCK_STUDENT = { name: 'Aaron Valencia', id: '202311325', course: 'BSIT 4th Year' }
const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  Booked: 'bg-amber-50 text-amber-700 border-amber-200',
}

// [ADD - URGENCY] - Badge colors lang
const URGENCY_STYLES = {
  Normal: 'bg-gray-100 text-gray-600 border-gray-200',
  Urgent: 'bg-orange-50 text-orange-700 border-orange-200',
  Emergency: 'bg-red-50 text-red-700 border-red-200',
}

export default function AppointmentHistory({ showToast }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNotice, setShowNotice] = useState(false)
  const [noticeMsg, setNoticeMsg] = useState('')
  const [filter, setFilter] = useState('All')
  // Kunin yung totoong naka-login, hindi lang MOCK
  const student = (() => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('student')
      if (raw) {
        const u = JSON.parse(raw)
        return {
          name: u.student_name || u.name || MOCK_STUDENT.name,
          id: String(u.student_id || u.studentId || u.id || MOCK_STUDENT.id),
          course: u.course || MOCK_STUDENT.course,
        }
      }
    } catch {}
    const sid = localStorage.getItem('student_id') || localStorage.getItem('studentId')
    if (sid) return { ...MOCK_STUDENT, id: String(sid) }
    return MOCK_STUDENT
  })()
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${BASE}/appointments/get_appointments.php?student_id=${student.id}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.data || [])
        const mapped = list.map(r => ({
          id: r.id,
          student_id: r.student_id,
          student_name: r.student_name,
          concern: r.concern,
          reason: r.concern || r.reason || 'No reason provided',
          appointment_date: r.appointment_date || r.date,
          consultation_hour: r.time_slot || r.consultation_hour || '',
          time_slot: r.time_slot,
          counselor_name: r.counselor_name || '',
          status: r.status || 'Pending',
          urgency_level: r.urgency_level,
        }))
        setHistory(mapped.reverse())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [student.id])

  // [FIX] Dati: local lang, kaya bumabalik sa Pending pag lumipat ng tab.
  // Ngayon: tinatawag na yung existing mong update_status.php, kaya naka-save na sa DB.
  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`${BASE}/appointments/update_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: 'Cancelled' })
      })
      const result = await res.json()
      if (!res.ok || result.success === false) throw new Error(result.message || 'Failed to cancel')

      setHistory(prev => prev.map(h => h.id === id ? { ...h, status: 'Cancelled' } : h))
      setNoticeMsg("Appointment cancelled successfully.")
      setShowNotice(true)
      if (showToast) showToast('Appointment cancelled')
    } catch (err) {
      setNoticeMsg(err.message); setShowNotice(true)
    }
  }

  const filtered = filter === 'All' ? history : history.filter(h => h.status === filter || (filter === 'Pending' && h.status === 'Booked'))
  const counts = {
    All: history.length,
    Pending: history.filter(h => h.status === 'Pending' || h.status === 'Booked').length,
    Approved: history.filter(h => h.status === 'Approved').length,
    Cancelled: history.filter(h => h.status === 'Cancelled').length,
  }

  return (
    <div className="bg-[#f6f8f7] w-full">
      <div className="bg-[#085041] px-6 md:px-10 py-8">
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[32px] md:text-[36px] font-bold text-white leading-none tracking-tight">Appointment History</h1>
            <p className="text-[13px] text-white/60 mt-2.5">
              {student.name} • {student.id} • {student.course}
            </p>
          </div>
          <div className="flex gap-1.5 p-1 bg-black/20 rounded-full">
            {['All', 'Pending', 'Approved', 'Cancelled'].map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`text-[12px] font-semibold px-4 py-1.5 rounded-full transition-all ${filter === t ? 'bg-white text-[#085041] shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                {t} {counts[t] > 0 ? `• ${counts[t]}` : ''}
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
              const apptDate = new Date(item.appointment_date)
              const isCancelled = item.status === 'Cancelled'
              const urgency = item.urgency_level || 'Normal'
              return (
                <div key={item.id} className={`bg-white rounded-xl border p-4 md:p-5 flex gap-4 transition-all ${isCancelled ? 'border-gray-200 opacity-70' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                  <div className={`w-[64px] h-[64px] rounded-lg flex flex-col items-center justify-center shrink-0 ${isCancelled ? 'bg-gray-100 text-gray-400' : 'bg-[#E1F5EE] text-[#085041]'}`}>
                    <span className="text-[11px] font-bold uppercase tracking-widest">{apptDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-[20px] font-bold leading-none mt-0.5">{apptDate.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-bold text-gray-900">GCO-{item.id}</p>
                          <span className="text-[11px] text-gray-400">•</span>
                          <p className="text-[12px] text-gray-600 truncate">{item.consultation_hour} • {item.counselor_name}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[item.status] || STATUS_STYLES.Pending}`}>{item.status}</span>
                    </div>

                    {/* [ADD - URGENCY] - Badge lang */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${URGENCY_STYLES[urgency] || URGENCY_STYLES.Normal}`}>
                        {urgency === 'Emergency' ? '🚨 Emergency' : urgency === 'Urgent' ? '⚠️ Urgent' : 'Normal'}
                      </span>
                      {urgency === 'Emergency' && <span className="text-[11px] text-red-600 font-medium">Prioritized by GCO</span>}
                    </div>

                    <p className="text-[12px] text-gray-600 mt-2 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      {item.reason || 'No reason provided'}
                    </p>

                    {/* [ADD - URGENCY] - Emergency contact, pag Emergency lang lalabas */}
                    {urgency === 'Emergency' && item.emergency_contact_name && (
                      <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <p className="text-[11px] font-bold text-red-700">Emergency Contact</p>
                        <p className="text-[11px] text-gray-700 mt-0.5">
                          {item.emergency_contact_name}
                          {item.emergency_contact_relation ? ` • ${item.emergency_contact_relation}` : ''}
                          {item.emergency_contact_no ? ` • ${item.emergency_contact_no}` : ''}
                        </p>
                      </div>
                    )}

                    {item.status === 'Pending' || item.status === 'Booked' ? (
                      <button onClick={() => cancelBooking(item.id)} className="mt-3 text-[11px] font-semibold text-gray-500 hover:text-red-600 transition-colors">
                        Cancel appointment →
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL - CLEAN */}
      {showNotice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-[340px] w-full shadow-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#085041] text-white flex items-center justify-center text-[12px] font-bold">✓</div>
            <p className="text-[13px] text-gray-700 mt-3 leading-relaxed">{noticeMsg}</p>
            <button onClick={() => setShowNotice(false)} className="w-full mt-4 py-2.5 rounded-full bg-[#085041] text-white font-bold text-[12px]">Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}
