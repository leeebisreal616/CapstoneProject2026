import { useState } from 'react'
import CvsuPortalModal from '../../components/CvsuPortalModal'
const BASE = 'http://localhost/gco-api'
export default function BookAppointment() {
  const [showPortal, setShowPortal] = useState(false)
  const [showNotice, setShowNotice] = useState(false)
  const [noticeMsg, setNoticeMsg] = useState('')
  const [noticeType, setNoticeType] = useState('error')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedCounselor, setSelectedCounselor] = useState(0)
  const [reason, setReason] = useState('')
  const [counselorPref, setCounselorPref] = useState('')
  const [langPref, setLangPref] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRel, setEmergencyRel] = useState('')
  const [emergencyNo, setEmergencyNo] = useState('')
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)
  const [loading, setLoading] = useState(false)
  // [ADD - URGENCY] - bago lang, walang ginalaw sa taas
  const [urgency, setUrgency] = useState('Normal')
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyAgreed, setEmergencyAgreed] = useState(false)
  // [ADD - URGENCY] - handler lang para sa urgency
  const handleUrgencyChange = (val) => {
    setUrgency(val)
    if (val === 'Emergency') {
      setShowEmergencyModal(true)
      setEmergencyAgreed(false)
    }
  }
  const counselors = [
    { name: "Jervin D. Quicho", role: "GCO Head - Imus", initial: "JQ" },
    { name: "Hazel Grace B. Malayo", role: "GCO Staff - Imus", initial: "HM" }
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
  const showNoticeModal = (msg, type = 'error') => { setNoticeMsg(msg); setNoticeType(type); setShowNotice(true) }
  const isWeekend = (dateStr) => { if (!dateStr) return false; const d = new Date(dateStr); return d.getDay() === 0 || d.getDay() === 6 }
  const getAvailableSlots = () => {
    if (!selectedDate || isWeekend(selectedDate)) return [];
    if (selectedDate !== new Date().toISOString().split('T')[0]) return allSlots;
    return allSlots.filter(s => s.hour24 > new Date().getHours())
  }
  const getNextWeekdays = () => {
    const days = []; let d = new Date();
    while (days.length < 10) { if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); d.setDate(d.getDate() + 1) }
    return days
  }
  const handleBook = async () => {
    if (!selectedDate || !selectedTime) { showNoticeModal("Select date and time"); return }
    if (!reason.trim() || !emergencyName || !emergencyNo) { showNoticeModal("Complete required fields"); return }
    if (!consent1 || !consent2) { showNoticeModal("Agree to consent statements"); return }
    // [ADD - URGENCY] - check lang kung Emergency pero hindi pa nag-agree sa disclaimer
    if (urgency === 'Emergency' && !emergencyAgreed) { showNoticeModal("Please read and agree to the Emergency Disclaimer first."); setShowEmergencyModal(true); return }
    setLoading(true)
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('student') || localStorage.getItem('gco_user') || '{}')
      const realStudentId = storedUser.student_id || storedUser.student_number || storedUser.id_number || '202311325'
      const firstName = storedUser.first_name || storedUser.fname || 'Aaron'
      const lastName = storedUser.last_name || storedUser.lname || 'Valencia'
      const course = storedUser.course || 'BSIT'
      const yearLevel = storedUser.year_level || storedUser.year || '4th Year'
      const studentInfo = `${firstName} ${lastName} - ${realStudentId} - ${course} ${yearLevel}`
      const res = await fetch(`${BASE}/appointments/create_appointment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: realStudentId,
          student_info: studentInfo,
          first_name: firstName,
          last_name: lastName,
          course: course,
          year_level: yearLevel,
          preferred_day: selectedDate,
          appointment_date: selectedDate,
          preferred_time: selectedTime,
          consultation_hour: selectedTime,
          counselor_name: counselors[selectedCounselor].name,
          reason: reason,
          status: 'Pending',
          // [ADD - URGENCY] - isa lang dinagdag sa body
          urgency_level: urgency
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Booking failed')
      showNoticeModal(`Booked as ${data.student_info || studentInfo}`, "success")
      setSelectedDate(''); setSelectedTime(''); setReason('')
      setEmergencyName(''); setEmergencyRel(''); setEmergencyNo('')
      // [ADD - URGENCY] - reset lang ng urgency
      setUrgency('Normal'); setEmergencyAgreed(false)
    } catch (err) { showNoticeModal(err.message) } finally { setLoading(false) }
  }
  const availableSlots = getAvailableSlots()
  const weekdays = getNextWeekdays()
  return (
    // [FIX] Dati: min-h-[calc(100vh-64px)] - may sariling height, kaya nahahati yung scroll.
    // Ngayon: w-full lang - sumasama na sa buong page scroll ng App.jsx (flex-col + sticky Topbar).
    <div className="bg-[#f6f8f7] w-full">
      <div className="bg-[#085041] px-6 md:px-10 py-8 flex flex-col lg:flex-row gap-6 justify-between">
        <div>
          <h2 className="text-[28px] font-semibold text-white leading-tight">Counseling Request Form</h2>
          <p className="text-[12px] text-white/60 mt-2">Official GCO Imus Form - Mon to Fri only, 7AM to 4PM</p>
        </div>
      </div>
      <div className="px-4 md:px-10 py-6 max-w-[760px] mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <p className="text-[12px] font-semibold">Select Counselor</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {counselors.map((c, i) => (
              <button key={i} onClick={() => setSelectedCounselor(i)} className={`p-4 rounded-xl border flex gap-3 items-center text-left transition-colors ${selectedCounselor === i ? 'border-[#085041] bg-[#E8F5F1]' : 'border-gray-200'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${selectedCounselor === i ? 'bg-[#085041] text-white' : 'bg-gray-100'}`}>{c.initial}</div>
                <div><p className="text-[12px] font-medium">{c.name}</p><p className="text-[10px] text-gray-500">{c.role}</p></div>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <label className="text-[12px] font-medium">Date</label>
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {weekdays.map((d, i) => {
                const iso = d.toISOString().split('T')[0]
                const isSel = iso === selectedDate
                return (
                  <button key={i} onClick={() => { setSelectedDate(iso); setSelectedTime('') }} className={`min-w-[68px] rounded-xl border px-3 py-2 text-center transition-colors ${isSel ? 'bg-[#085041] text-white border-[#085041]' : 'bg-[#f6f8f7] border-gray-200'}`}>
                    <p className="text-[10px] uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-[16px] font-semibold">{d.getDate()}</p>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-6">
            <label className="text-[12px] font-medium">Time</label>
            {!selectedDate ? <p className="text-[12px] text-gray-400 mt-2">Select a date first</p> : <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {availableSlots.map((t, i) => (<button key={i} onClick={() => setSelectedTime(t.label)} className={`py-2.5 rounded-xl border text-[12px] font-medium transition-colors ${selectedTime === t.label ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white border-gray-200'}`}>{t.label}</button>))}
            </div>}
          </div>
          <div className="mt-6">
            <label className="text-[12px] font-medium">Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Academic, Career, Psychological..." className="w-full mt-2 bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] h-20 focus:outline-none focus:border-[#085041]" />
          </div>
          {/* [ADD - URGENCY] - Bagong section lang, walang ginalaw sa taas/baba */}
          <div className="mt-6">
            <label className="text-[12px] font-medium">Urgency Level <span className="text-red-500">*</span></label>
            <select value={urgency} onChange={e => handleUrgencyChange(e.target.value)} className="w-full mt-2 bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:border-[#085041]">
              <option value="Normal">Normal - I can wait 3-5 days</option>
              <option value="Urgent">Urgent - Need within 24-48 hours</option>
              <option value="Emergency">🚨 Emergency - Need help now</option>
            </select>
            {urgency === 'Emergency' && <p className="text-[11px] text-red-600 font-medium mt-2">This will notify admin immediately as URGENT. Please read the Emergency Disclaimer.</p>}
            {urgency === 'Urgent' && <p className="text-[11px] text-orange-600 mt-2">Admin will prioritize this within 24-48 hours.</p>}
          </div>
          <div className="mt-6 border-t pt-6">
            <p className="text-[12px] font-medium">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <input value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="Full name" className="col-span-2 bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px]" />
              <input value={emergencyRel} onChange={e => setEmergencyRel(e.target.value)} placeholder="Relation" className="bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px]" />
              <input value={emergencyNo} onChange={e => setEmergencyNo(e.target.value)} placeholder="Contact number" className="col-span-3 bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px]" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <label className="flex gap-2 text-[11px]"><input type="checkbox" checked={consent1} onChange={e => setConsent1(e.target.checked)} /> I consent to GCO keeping records of my session</label>
            <label className="flex gap-2 text-[11px]"><input type="checkbox" checked={consent2} onChange={e => setConsent2(e.target.checked)} /> I understand confidentiality under DPA 2012</label>
          </div>
          <button onClick={handleBook} disabled={loading} className="w-full mt-6 bg-[#085041] text-white font-medium py-3 rounded-full text-[13px]">{loading ? 'Booking...' : urgency === 'Emergency' ? '🚨 Send Emergency Request' : 'Confirm Booking'}</button>
          {/* [ADD - URGENCY] - Limitations footer lang */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-3">*LIMITATION: If life and death situation, please contact nearest hospital / NCMH Crisis Hotline 1553 / 911 immediately. This portal is monitored only during school hours (Mon-Thurs, 7AM-4PM).</p>
        </div>
      </div>
      {/* [ADD - URGENCY] - Emergency Disclaimer Modal lang */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-6">
            <h2 className="text-[16px] font-bold text-red-600">⚠️ Emergency Disclaimer</h2>
            <div className="text-[12px] text-gray-600 mt-3 leading-relaxed space-y-2">
              <p>You selected <b>Emergency - Need help now</b>.</p>
              <p className="bg-red-50 border border-red-200 rounded-xl p-3">
                <b>If this is life-threatening:</b><br />
                - Call nearest hospital / 911<br />
                - NCMH Crisis Hotline: <b>1553</b><br />
                - Smart: 0919-057-1553 | Globe: 0917-899-8727<br /><br />
                <b>School Hours:</b> Mon-Thurs 7AM-4PM only<br />
                Severe cases may be referred to external professionals / hospital.
              </p>
              <p>This system is <b>NOT</b> for immediate medical emergencies. Admin will be notified ASAP but response is during school hours only.</p>
            </div>
            <label className="flex gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={emergencyAgreed} onChange={e => setEmergencyAgreed(e.target.checked)} />
              <span className="text-[12px] font-semibold">I understand. I will contact hotline if life-threatening, and I agree to wait for admin response.</span>
            </label>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowEmergencyModal(false); setUrgency('Normal') }} className="flex-1 border border-gray-200 py-2.5 rounded-full text-[13px]">Cancel</button>
              <button onClick={() => emergencyAgreed && setShowEmergencyModal(false)} disabled={!emergencyAgreed} className="flex-1 bg-red-600 text-white py-2.5 rounded-full text-[13px] font-bold disabled:opacity-40">I Understand, Continue</button>
            </div>
          </div>
        </div>
      )}
      {showNotice && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 max-w-[360px] w-full border border-gray-200"><h3 className="text-[13px] font-semibold">{noticeType === 'success' ? 'Success' : 'Notice'}</h3><p className="text-[12px] text-gray-600 mt-2">{noticeMsg}</p><button onClick={() => setShowNotice(false)} className="w-full mt-4 py-2.5 rounded-full bg-[#085041] text-white text-[12px]">Close</button></div></div>)}
      <CvsuPortalModal open={showPortal} onClose={() => setShowPortal(false)} />
    </div>
  )
}