import { useState, useEffect, useMemo } from 'react'
const BASE = 'https://cheerful-magenta-fly-38.hostingersite.com/api'
const ALL_SLOTS = [
  { label: "7AM-8AM", hour24: 7 },
  { label: "8AM-9AM", hour24: 8 },
  { label: "9AM-10AM", hour24: 9 },
  { label: "10AM-11AM", hour24: 10 },
  { label: "11AM-12PM", hour24: 11 },
  { label: "1PM-2PM", hour24: 13 },
  { label: "2PM-3PM", hour24: 14 },
  { label: "3PM-4PM", hour24: 15 },
]
const URGENCY_OPTS = [
  { value: 'Routine', label: 'Routine - General concern, for scheduled consultation' },
  { value: 'Urgent', label: 'Urgent - Experiencing significant distress, needs earlier attention' },
  { value: 'Crisis', label: 'Crisis - In distress, needs immediate support' },
]
const CRISIS_HOTLINES = [
  { label: "National Emergency", number: "911", note: "For immediate danger" },
  { label: "NCMH Crisis Hotline", number: "1553", note: "Toll-free landline, 24/7" },
  { label: "NCMH - Globe / TM", number: "0917-899-8727", note: "24/7" },
  { label: "NCMH - Smart / TNT", number: "0919-057-1553", note: "24/7" },
  { label: "NCMH - Globe / TM", number: "0966-351-4518", note: "24/7" },
  { label: "Hopeline PH", number: "0917-558-4673", note: "Suicide prevention, 24/7" },
  { label: "Hopeline - Globe / TM", number: "2919", note: "Toll-free" },
  { label: "In Touch Crisis Line", number: "(02) 8893-7603", note: "Free, confidential, 24/7" },
]
const NEARBY_CAVITE = [
  { name: "Cavite Center for Mental Health", loc: "Brgy. Luciano, Trece Martires City" },
  { name: "Dasmariñas City Health Office", loc: "Dasmariñas, Cavite - Mental Health Package Provider" },
  { name: "Niche Psychological Services", loc: "Imus City, Cavite - Psychotherapy & Assessment" },
  { name: "Ospital ng Imus", loc: "Imus, Cavite - (046) 438-7745 - Nearest ER" },
]
const inputCls = "w-full bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:border-[#085041]"
const toLocalISO = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const formatDate = (iso) => {
  if (!iso || iso === 'To be assigned' || iso === '0000-00-00') return 'To be assigned'
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return 'To be assigned'
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
function Section({ title, children }) {
  return (
    <div className="mt-6">
      <label className="text-[12px] font-medium">{title}</label>
      <div className="mt-2">{children}</div>
    </div>
  )
}
function Modal({ children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999] overflow-y-auto">
      <div className={`bg-white rounded-2xl w-full p-6 my-6 ${wide ? 'max-w-[520px]' : 'max-w-[420px]'}`}>{children}</div>
    </div>
  )
}
export default function BookAppointment() {
  const [notice, setNotice] = useState({ msg: '', type: 'error', show: false })
  const [loading, setLoading] = useState(false)
  const [urgency, setUrgency] = useState('Routine')
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [crisisAgreed, setCrisisAgreed] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [counsellors, setCounsellors] = useState([])
  const [loadingCounsellors, setLoadingCounsellors] = useState(true)
  const [bookedSlots, setBookedSlots] = useState([])
  const [activeBooking, setActiveBooking] = useState(null)
  const [checkingActive, setCheckingActive] = useState(true)
  const [form, setForm] = useState({
    date: '', time: '', counselor: 0, reason: '',
    emergencyName: '', emergencyRel: '', emergencyNo: '',
    consent1: false, consent2: false,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const showNotice = (msg, type = 'error') => setNotice({ msg, type, show: true })
  const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || localStorage.getItem('student') || localStorage.getItem('gco_user') || '{}') } catch { return {} }
  }

  // 1. Counselors
  useEffect(() => {
    fetch(`${BASE}/counsellor/list_counsellors.php`)
      .then(r => r.json())
      .then(j => {
        if (j.success && j.counsellors) {
          setCounsellors(j.counsellors.map(c => ({
            name: c.name,
            role: c.role_label || 'GCO - Imus',
            initial: c.initials || 'G',
            profile_photo: c.profile_photo || null,
          })))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCounsellors(false))
  }, [])

  // 2. Approval Lock - FIXED: get_appointments.php na
  const fetchActiveBooking = async () => {
    const user = getStoredUser()
    const sid = user.student_id || user.student_number || user.id_number
    if (!sid) { setCheckingActive(false); return }
    try {
      const res = await fetch(`${BASE}/appointments/get_appointments.php?student_id=${sid}`)
      const j = await res.json()
      const list = Array.isArray(j) ? j : (j.appointments || j.data || [])
      const active = list.find(a => ['Pending', 'Approved'].includes(a.status))
      setActiveBooking(active || null)
    } catch { setActiveBooking(null) }
    finally { setCheckingActive(false) }
  }
  useEffect(() => { fetchActiveBooking() }, [])

  // 3. Mon-Thurs only, next 10 weekdays. Urgent = next 2 weekdays lang
  const weekdays = useMemo(() => {
    const days = []
    const d = new Date()
    const limit = urgency === 'Urgent' ? 2 : 10
    while (days.length < limit) {
      const day = d.getDay()
      if (day !== 0 && day !== 5 && day !== 6) days.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return days
  }, [urgency])

  // 4. FIXED: Past time - exact minutes + 30 mins buffer
  const availableSlots = useMemo(() => {
    if (!form.date) return []
    if (form.date !== toLocalISO(new Date())) return ALL_SLOTS
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    return ALL_SLOTS.filter(s => (s.hour24 * 60) > nowMinutes + 30)
  }, [form.date])

  // 5. Double-booking - fetch booked slots per counselor + date
  useEffect(() => {
    if (!form.date || counsellors.length === 0) { setBookedSlots([]); return }
    const counselorName = counsellors[form.counselor]?.name
    if (!counselorName) return
    fetch(`${BASE}/appointments/get_booked_slots.php?counselor=${encodeURIComponent(counselorName)}&date=${form.date}`)
      .then(r => r.json())
      .then(j => setBookedSlots(j.booked || []))
      .catch(() => setBookedSlots([]))
  }, [form.date, form.counselor, counsellors])

  const handleUrgencyChange = (val) => {
    setUrgency(val)
    setForm(f => ({ ...f, date: '', time: '' }))
    if (val === 'Crisis') { setShowCrisisModal(true); setCrisisAgreed(false) }
  }
  const validateForm = () => {
    if (urgency !== 'Crisis' && (!form.date || !form.time)) { showNotice("Please select a date and time."); return false }
    if (form.reason.trim().length < 30) { showNotice("Please provide a more detailed reason (at least 30 characters) so the counselor can prepare for your session."); return false }
    if (!form.emergencyName.trim() || !form.emergencyNo.trim()) { showNotice("Please complete your emergency contact information."); return false }
    if (!/^09\d{9}$/.test(form.emergencyNo.replace(/\s|-/g, ''))) { showNotice("Please enter a valid 11-digit mobile number (e.g. 09171234567) for your emergency contact."); return false }
    if (!form.consent1 || !form.consent2) { showNotice("Please agree to both consent statements to continue."); return false }
    if (urgency === 'Crisis' && !crisisAgreed) { showNotice("Please read and agree to the Crisis Support Notice first."); setShowCrisisModal(true); return false }
    return true
  }
  const handleBook = async () => {
    if (!validateForm()) return
    setShowConfirmModal(true)
  }
  const confirmBooking = async () => {
    setShowConfirmModal(false)
    setLoading(true)
    try {
      const storedUser = getStoredUser()
      const realStudentId = storedUser.student_id || storedUser.student_number || storedUser.id_number
      if (!realStudentId) throw new Error("Session expired. Please login again.")
      const firstName = storedUser.first_name || storedUser.fname || ''
      const lastName = storedUser.last_name || storedUser.lname || ''
      const course = storedUser.course || ''
      const yearLevel = storedUser.year_level || storedUser.year || ''
      const studentInfo = `${firstName} ${lastName} - ${realStudentId} - ${course} ${yearLevel}`.trim()
      const res = await fetch(`${BASE}/appointments/create_appointment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: realStudentId,
          student_info: studentInfo,
          first_name: firstName,
          last_name: lastName,
          course,
          year_level: yearLevel,
          preferred_day: form.date || null,
          appointment_date: form.date || null,
          preferred_time: form.time || 'To be assigned',
          consultation_hour: form.time || 'To be assigned',
          counselor_name: counsellors[form.counselor]?.name || 'To be assigned',
          reason: form.reason.trim(),
          status: 'Pending',
          urgency_level: urgency,
          emergency_contact_name: form.emergencyName,
          emergency_contact_relation: form.emergencyRel,
          emergency_contact_no: form.emergencyNo,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Booking failed')
      setNotice({
        msg: `__SUCCESS__${JSON.stringify({
          counselor: counsellors[form.counselor]?.name || 'To be assigned',
          date: form.date ? formatDate(form.date) : 'To be assigned by counselor',
          time: form.time || 'To be assigned by counselor',
          urgency,
        })}`,
        type: 'success', show: true,
      })
      setForm(f => ({ ...f, date: '', time: '', reason: '', emergencyName: '', emergencyRel: '', emergencyNo: '' }))
      setUrgency('Routine')
      setCrisisAgreed(false)
      fetchActiveBooking()
    } catch (err) { showNotice(err.message) }
    finally { setLoading(false) }
  }
  const handleCancelActive = async () => {
    if (!activeBooking?.id) return
    if (!window.confirm("Are you sure you want to cancel this request? You can submit a new request after cancelling.")) return
    try {
      const res = await fetch(`${BASE}/appointments/cancel_appointment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeBooking.id }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.message || 'Cancel failed')
      setActiveBooking(null)
      showNotice("Your request has been cancelled. You can now submit a new request.", "success")
    } catch (e) { showNotice(e.message) }
  }

  let successData = null
  if (notice.type === 'success' && notice.msg.startsWith('__SUCCESS__')) {
    try { successData = JSON.parse(notice.msg.replace('__SUCCESS__', '')) } catch {}
  }

  return (
    <div className="bg-[#f6f8f7] w-full">
      <div className="bg-[#085041] px-6 md:px-10 py-8">
        <h2 className="text-[28px] font-semibold text-white leading-tight">Request for Counseling Session</h2>
        <p className="text-[12px] text-white/60 mt-3">Guidance and Counseling Office - CvSU Imus <span className="mx-1.5 text-white/30">|</span> Monday to Thursday, 7:00 AM to 4:00 PM</p>
      </div>
      <div className="px-4 md:px-10 py-6 max-w-[760px] mx-auto">
        {checkingActive ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-[12px] text-gray-500">Checking your requests...</div>
        ) : activeBooking ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-[13px] font-semibold text-amber-800">You have a pending request</p>
              <p className="text-[12px] text-amber-700 mt-1">Your request is waiting for approval from the Guidance Office. You will be notified once it is confirmed.</p>
            </div>
            <div className="mt-4 space-y-1 text-[12px]">
              <p><b>Counselor:</b> {activeBooking.counselor_name || 'To be assigned'}</p>
              <p><b>Date:</b> {formatDate(activeBooking.appointment_date)}</p>
              <p><b>Time:</b> {activeBooking.preferred_time || activeBooking.consultation_hour || 'To be assigned'}</p>
              <p><b>Priority:</b> {activeBooking.urgency_level || 'Routine'}</p>
              <p><b>Status:</b> <span className="font-semibold text-amber-600">{activeBooking.status}</span></p>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => window.location.href = '/student/appointments'} className="flex-1 bg-[#085041] text-white py-2.5 rounded-full text-[13px]">View My Appointment</button>
              <button onClick={handleCancelActive} className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-full text-[13px]">Cancel Request</button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3">You can submit a new request after this one is completed, declined, or cancelled.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-[12px] font-semibold">Preferred Counselor</p>
            {loadingCounsellors ? (
              <div className="mt-3 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center"><p className="text-[12px] text-gray-500">Loading counselors...</p></div>
            ) : counsellors.length === 0 ? (
              <div className="mt-3 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
                <p className="text-[12px] text-gray-500">No counselor assigned yet. Your request will be assigned by the Guidance Office.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {counsellors.map((c, i) => (
                  <button key={c.name} onClick={() => set('counselor', i)} className={`p-4 rounded-xl border flex gap-3 items-center text-left transition-colors ${form.counselor === i ? 'border-[#085041] bg-[#E8F5F1]' : 'border-gray-200'}`}>
                    {c.profile_photo ? (
                      <img src={c.profile_photo} alt={c.name} className="w-8 h-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold ${form.counselor === i ? 'bg-[#085041] text-white' : 'bg-gray-100'}`}>{c.initial}</div>
                    )}
                    <div><p className="text-[12px] font-medium">{c.name}</p><p className="text-[10px] text-gray-500">{c.role}</p></div>
                  </button>
                ))}
              </div>
            )}
            <Section title={<>Priority Level <span className="text-red-500">*</span></>}>
              <select value={urgency} onChange={e => handleUrgencyChange(e.target.value)} className={inputCls}>
                {URGENCY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {urgency === 'Crisis' && <p className="text-[11px] text-red-600 font-medium mt-2">Your request will be prioritized. Please read the Crisis Support Notice. A counselor will assign your schedule.</p>}
              {urgency === 'Urgent' && <p className="text-[11px] text-orange-600 mt-2">Please select from the next available dates. Your request will be prioritized for earlier attention.</p>}
              {urgency === 'Routine' && <p className="text-[11px] text-gray-500 mt-2">Please select your preferred date and time for your consultation.</p>}
            </Section>
            {urgency !== 'Crisis' && (
              <>
                <Section title="Preferred Date">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {weekdays.map((d, i) => {
                      const iso = toLocalISO(d)
                      const isSel = iso === form.date
                      return (
                        <button key={i} onClick={() => { set('date', iso); set('time', '') }} className={`min-w-[68px] rounded-xl border px-3 py-2 text-center transition-colors ${isSel ? 'bg-[#085041] text-white border-[#085041]' : 'bg-[#f6f8f7] border-gray-200'}`}>
                          <p className="text-[10px] uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-[16px] font-semibold">{d.getDate()}</p>
                          <p className="text-[9px] opacity-70">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
                        </button>
                      )
                    })}
                  </div>
                </Section>
                <Section title="Preferred Time">
                  {!form.date ? <p className="text-[12px] text-gray-400">Please select a date first</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availableSlots.length === 0 ? (
                        <p className="text-[12px] text-gray-400 col-span-4">No more slots available today. Please choose another date.</p>
                      ) : availableSlots.map(t => {
                        const isBooked = bookedSlots.includes(t.label)
                        return (
                          <button key={t.label} disabled={isBooked} onClick={() => set('time', t.label)} className={`py-2.5 rounded-xl border text-[12px] font-medium transition-colors ${isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' : form.time === t.label ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white border-gray-200'}`}>
                            {t.label} {isBooked ? '- Unavailable' : ''}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {form.date && bookedSlots.length > 0 && <p className="text-[11px] text-gray-400 mt-2">Grayed-out slots are already booked for this counselor on this date.</p>}
                </Section>
              </>
            )}
            <Section title={<>Reason for Consultation / Presenting Concern <span className="text-red-500">*</span></>}>
              <textarea value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Please briefly describe what you would like to discuss with your counselor..." className={inputCls + " h-24 resize-none"} />
              <p className="text-[11px] text-gray-400 mt-1 text-right">{form.reason.trim().length} / 30 characters minimum</p>
            </Section>
            <div className="mt-6 border-t pt-6">
              <p className="text-[12px] font-medium">Emergency Contact Person <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <input value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="Full Name" className={inputCls + " col-span-2"} />
                <input value={form.emergencyRel} onChange={e => set('emergencyRel', e.target.value)} placeholder="Relationship to Student" className={inputCls} />
                <input value={form.emergencyNo} onChange={e => set('emergencyNo', e.target.value)} placeholder="Mobile Number (09XXXXXXXXX)" className={inputCls + " col-span-3"} />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <label className="flex gap-2 text-[11px] leading-relaxed"><input type="checkbox" checked={form.consent1} onChange={e => set('consent1', e.target.checked)} className="mt-0.5" /> I consent to the Guidance and Counseling Office keeping a confidential record of this session.</label>
              <label className="flex gap-2 text-[11px] leading-relaxed"><input type="checkbox" checked={form.consent2} onChange={e => set('consent2', e.target.checked)} className="mt-0.5" /> I understand that all information shared will be kept confidential in accordance with the Data Privacy Act of 2012.</label>
            </div>
            <button onClick={handleBook} disabled={loading} className="w-full mt-6 bg-[#085041] text-white font-medium py-3 rounded-full text-[13px] disabled:opacity-60">
              {loading ? 'Submitting...' : urgency === 'Crisis' ? 'Submit Crisis Request' : 'Submit Request'}
            </button>
            <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-3">If you are in immediate danger, please call 911 or the NCMH Crisis Hotline at 1553. This portal is monitored during school hours only (Monday to Thursday, 7:00 AM - 4:00 PM).</p>
          </div>
        )}
      </div>
      {showConfirmModal && (
        <Modal>
          <h2 className="text-[15px] font-semibold">Please confirm your request</h2>
          <div className="text-[12px] text-gray-600 mt-3 space-y-1">
            <p><b>Counselor:</b> {counsellors[form.counselor]?.name || 'To be assigned'}</p>
            <p><b>Date:</b> {urgency === 'Crisis' ? 'To be assigned by counselor' : formatDate(form.date)}</p>
            <p><b>Time:</b> {urgency === 'Crisis' ? 'To be assigned by counselor' : form.time}</p>
            <p><b>Priority:</b> {urgency}</p>
            <p className="pt-2"><b>Concern:</b> {form.reason.trim()}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
            <p className="text-[11px] text-amber-800 leading-relaxed">Please ensure this information is correct. False or prank requests may delay support for students who genuinely need help, and may affect your future booking privileges.</p>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setShowConfirmModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-full text-[13px]">Go Back</button>
            <button onClick={confirmBooking} className="flex-1 bg-[#085041] text-white py-2.5 rounded-full text-[13px] font-medium">Confirm & Submit</button>
          </div>
        </Modal>
      )}
      {showCrisisModal && (
        <Modal wide>
          <h2 className="text-[16px] font-bold text-red-600">Crisis Support Notice</h2>
          <p className="text-[12px] text-gray-600 mt-2 leading-relaxed">You selected <b>Crisis - I need immediate support</b>. Your request will be prioritized by the Guidance Office.</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3 space-y-2">
            <p className="text-[12px] font-bold">If you are in immediate danger, call now:</p>
            {CRISIS_HOTLINES.map(h => (
              <div key={h.label + h.number} className="flex justify-between gap-2 text-[12px]">
                <span><b>{h.label}</b> <span className="text-gray-500">- {h.note}</span></span>
                <a href={`tel:${h.number.replace(/[^0-9]/g, '')}`} className="font-bold text-red-700 shrink-0">{h.number}</a>
              </div>
            ))}
          </div>
          <div className="bg-[#E8F5F1] border border-[#085041]/20 rounded-xl p-3 mt-3">
            <p className="font-bold text-[12px]">Nearby Support in Cavite (For referral / follow-up)</p>
            {NEARBY_CAVITE.map(c => (
              <p key={c.name} className="text-[11px] mt-1"><b>{c.name}</b> - {c.loc}</p>
            ))}
            <p className="text-[10px] text-gray-500 mt-2">These facilities are not 24/7 hotlines. For immediate help, call 1553 or 911 above.</p>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">This portal is monitored during school hours only (Monday to Thursday, 7:00 AM - 4:00 PM). Your request will be prioritized, but for immediate assistance, please use the hotlines above.</p>
          <label className="flex gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={crisisAgreed} onChange={e => setCrisisAgreed(e.target.checked)} />
            <span className="text-[12px] font-semibold">I understand. I will contact the hotline if I am in immediate danger.</span>
          </label>
          <div className="flex gap-2 mt-5">
            <button onClick={() => { setShowCrisisModal(false); setUrgency('Routine') }} className="flex-1 border border-gray-200 py-2.5 rounded-full text-[13px]">Cancel</button>
            <button onClick={() => crisisAgreed && setShowCrisisModal(false)} disabled={!crisisAgreed} className="flex-1 bg-red-600 text-white py-2.5 rounded-full text-[13px] font-bold disabled:opacity-40">I Understand, Continue</button>
          </div>
        </Modal>
      )}
      {notice.show && (
        <Modal>
          {successData ? (
            <>
              <h3 className="text-[15px] font-semibold text-[#085041]">Request Submitted Successfully</h3>
              <p className="text-[12px] text-gray-600 mt-2">Thank you. Your request for a counseling session has been received.</p>
              <div className="bg-gray-50 rounded-xl p-3 mt-3 space-y-1 text-[12px]">
                <p><b>Counselor:</b> {successData.counselor}</p>
                <p><b>Date:</b> {successData.date}</p>
                <p><b>Time:</b> {successData.time}</p>
                <p><b>Status:</b> <span className="font-semibold text-amber-600">Pending for Approval</span></p>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">The Guidance Office will review your request and confirm your schedule. Please check your My Appointments for updates. All information shared is kept confidential in accordance with the Data Privacy Act of 2012.</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setNotice(n => ({ ...n, show: false })); window.location.href = '/student/appointments' }} className="flex-1 bg-[#085041] text-white py-2.5 rounded-full text-[12px]">View My Appointments</button>
                <button onClick={() => setNotice(n => ({ ...n, show: false }))} className="flex-1 border py-2.5 rounded-full text-[12px]">Done</button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-[13px] font-semibold">{notice.type === 'success' ? 'Success' : 'Notice'}</h3>
              <p className="text-[12px] text-gray-600 mt-2">{notice.msg}</p>
              <button onClick={() => setNotice(n => ({ ...n, show: false }))} className="w-full mt-4 py-2.5 rounded-full bg-[#085041] text-white text-[12px]">Close</button>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}