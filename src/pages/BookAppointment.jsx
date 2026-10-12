import { useState } from 'react'
import CvsuPortalModal from '../components/CvsuPortalModal'

export default function BookAppointment() {
  const [showPortal, setShowPortal] = useState(false)
  const [showNotice, setShowNotice] = useState(false)
  const [noticeMsg, setNoticeMsg] = useState('')
  const [noticeType, setNoticeType] = useState('error')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedCounselor, setSelectedCounselor] = useState(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const counselors = [
    { name: "Jervin D. Quicho", role: "GCO Head - Imus", avail: "Mon-Fri Only" },
    { name: "Hazel Grace B. Malayo", role: "GCO Staff - Imus", avail: "Mon-Fri Only" }
  ]

  const allSlots = [
    { label: "7AM-8AM", hour24: 7 },
    { label: "8AM-9AM", hour24: 8 },
    { label: "9AM-10AM", hour24: 9 },
    { label: "10AM-11AM", hour24: 10 },
    { label: "11AM-12PM", hour24: 11 },
    { label: "1PM-2PM", hour24: 13 },
    { label: "2PM-3PM", hour24: 14 },
    { label: "3PM-4PM", hour24: 15 },
  ]

  const showNoticeModal = (msg, type='error') => {
    setNoticeMsg(msg)
    setNoticeType(type)
    setShowNotice(true)
  }

  const isWeekend = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    const day = d.getDay()
    return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
  }

  const isToday = (dateStr) => {
    if (!dateStr) return false
    return dateStr === new Date().toISOString().split('T')[0]
  }

  const getAvailableSlots = () => {
    if (!selectedDate) return []
    if (isWeekend(selectedDate)) return []
    if (!isToday(selectedDate)) return allSlots
    const currentHour = new Date().getHours()
    return allSlots.filter(s => s.hour24 > currentHour)
  }

  const handleBook = async () => {
    if (!selectedDate ||!selectedTime) {
      showNoticeModal("Please select both date and time to proceed.")
      return
    }
    if (isWeekend(selectedDate)) {
      showNoticeModal("Cannot book on weekends - school is closed (Mon-Fri only).")
      return
    }
    if (!reason.trim()) {
      showNoticeModal("Please provide a reason for your counseling session.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        appointment_date: selectedDate,
        consultation_hour: selectedTime,
        counselor_name: counselors[selectedCounselor].name,
        reason: reason,
        student_info: "Aaron Valencia - 202311325 - BSIT 4th Year",
        status: "Pending"
      }

      const res = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Booking failed')

      showNoticeModal("Your counseling appointment has been successfully booked and saved to the system.", "success")
      setSelectedDate(''); setSelectedTime(''); setReason('')
    } catch (err) {
      showNoticeModal(err.message)
    } finally {
      setLoading(false)
    }
  }

  const availableSlots = getAvailableSlots()

  return (
    <div className="pb-24 px-4 pt-4 max-w-[420px] mx-auto">
      <div className="bg-white rounded-[20px] p-4 flex items-center gap-3 shadow-sm border border-gray-100">
        <div className="w-12 h-12 rounded-full bg-[#085041] text-white flex items-center justify-center font-bold">AV</div>
        <div className="flex-1">
          <p className="font-bold text-[14px] text-gray-900">Aaron Valencia</p>
          <p className="text-[11px] text-gray-500">202311325 • BSIT 4th Year</p>
        </div>
        <button onClick={() => setShowPortal(true)} className="text-[10px] bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-semibold">Auto-filled from CvSU Portal ↗</button>
      </div>

      <h2 className="font-bold text-[18px] mt-6 mb-3">Book Appointment</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {counselors.map((c, i) => (
          <button key={i} onClick={() => setSelectedCounselor(i)} className={`text-left p-3 rounded-2xl border ${selectedCounselor === i? 'border-[#085041] bg-[#E1F5EE]' : 'border-gray-200 bg-white'}`}>
            <p className="font-bold text-[12px]">{c.name}</p>
            <p className="text-[10px] text-gray-500">{c.role}</p>
            <p className="text-[10px] text-gray-400 mt-1">{c.avail}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[20px] p-4 border border-gray-100">
        <label className="text-[12px] font-semibold">Date (Mon-Fri Only)</label>
        <input type="date" value={selectedDate} onChange={e => {
          const val = e.target.value
          if (isWeekend(val)) {
            showNoticeModal("Weekends are closed. Please select Monday to Friday only.")
            setSelectedDate(''); setSelectedTime(''); return
          }
          setSelectedDate(val); setSelectedTime('')
        }} className="w-full mt-1 mb-3 border rounded-xl px-3 py-2.5 text-[13px]" min={new Date().toISOString().split('T')[0]} />

        <label className="text-[12px] font-semibold">Time (1 hour fixed)</label>
        {!selectedDate? <p className="text-[11px] text-gray-400 mt-1 mb-3">Select a date first</p>
        : isWeekend(selectedDate)? <p className="text-[11px] text-red-500 mt-1 mb-3 bg-red-50 p-2.5 rounded-xl">Weekend closed. Mon-Fri only.</p>
        : availableSlots.length === 0? <p className="text-[11px] text-red-500 mt-1 mb-3 bg-red-50 p-2.5 rounded-xl">No available slots left today.</p>
        : <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full mt-1 mb-3 border rounded-xl px-3 py-2.5 text-[13px]">
            <option value="">Select time</option>
            {availableSlots.map((t, i) => <option key={i} value={t.label}>{t.label}</option>)}
          </select>}

        <label className="text-[12px] font-semibold">Reason (required)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Academic, Career, Personal..." className="w-full mt-1 border rounded-xl px-3 py-2.5 text-[13px] h-20" />

        <button onClick={handleBook} disabled={loading} className="w-full mt-4 bg-[#085041] text-white font-bold py-3 rounded-full text-[14px] disabled:opacity-50">
          {loading? 'Booking...' : 'Confirm Booking'}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">Mon-Fri Only • 1hr/counselor • Fair scheduling</p>
      </div>

      {showNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className={`bg-white rounded-2xl p-5 max-w-[340px] w-full shadow-2xl border-t-4 ${noticeType === 'success'? 'border-green-600' : 'border-red-500'}`}>
            <h3 className={`font-bold text-[15px] ${noticeType === 'success'? 'text-green-700' : 'text-red-600'}`}>{noticeType === 'success'? '✅ Success!' : '⚠️ Notice'}</h3>
            <p className="text-[13px] text-gray-700 mt-2 whitespace-pre-line">{noticeMsg}</p>
            <button onClick={() => setShowNotice(false)} className={`w-full mt-4 py-2.5 rounded-full text-white font-bold text-[13px] ${noticeType === 'success'? 'bg-green-600' : 'bg-red-600'}`}>OK</button>
          </div>
        </div>
      )}

      <CvsuPortalModal open={showPortal} onClose={() => setShowPortal(false)} />
    </div>
  )
}