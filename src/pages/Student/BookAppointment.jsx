import { useState, useEffect } from 'react'
import CvsuPortalModal from '../../components/CvsuPortalModal'

// LOCAL: D:\xampp\htdocs\gco-api
const BASE = 'https://cheerful-magenta-fly-38.hostingersite.com/api'
// LIVE: InfinityFree - ibalik mo to pag magde-deploy ka
// const BASE = 'https://gco-api.infinityfreeapp.com'

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
  { value: 'Normal', label: 'Normal - I can wait 3-5 days' },
  { value: 'Urgent', label: 'Urgent - Need within 24-48 hours' },
  { value: 'Emergency', label: '🚨 Emergency - Need help now' },
]

function Divider() { return <span className="w-px h-3 bg-gray-300 shrink-0" /> }

const inputCls = "w-full bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:border-[#085041]"

function Section({ title, children }) { return <div className="mt-6"><label className="text-[12px] font-medium">{title}</label><div className="mt-2">{children}</div></div> }

function Modal({ children }) { return <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999]"><div className="bg-white rounded-2xl max-w-[420px] w-full p-6">{children}</div></div> }

export default function BookAppointment() {
  const [showPortal, setShowPortal] = useState(false)
  const [notice, setNotice] = useState({ msg: '', type: 'error', show: false })
  const [loading, setLoading] = useState(false)
  const [urgency, setUrgency] = useState('Normal')
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyAgreed, setEmergencyAgreed] = useState(false)

  // BAGO: Hindi na hardcode, galing na sa list_counsellors.php (admin_users)
  const [COUNSELORS, setCounsellors] = useState([])
  const [loadingCounsellors, setLoadingCounsellors] = useState(true)

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

  const [form, setForm] = useState({ date: '', time: '', counselor: 0, reason: '', counselorPref: '', langPref: '', emergencyName: '', emergencyRel: '', emergencyNo: '', consent1: false, consent2: false, })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const showNoticeModal = (msg, type = 'error') => setNotice({ msg, type, show: true })
  const handleUrgencyChange = (val) => { setUrgency(val); if (val === 'Emergency') { setShowEmergencyModal(true); setEmergencyAgreed(false) } }

  const getNextWeekdays = () => { const days = []; let d = new Date(); while (days.length < 10) { if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); d.setDate(d.getDate() + 1) } return days }
  const weekdays = getNextWeekdays()
  const getAvailableSlots = () => { if (!form.date) return []; const today = new Date().toISOString().split('T')[0]; if (form.date !== today) return ALL_SLOTS; return ALL_SLOTS.filter(s => s.hour24 > new Date().getHours()) }
  const availableSlots = getAvailableSlots()

  const handleBook = async () => {
    if (!form.date || !form.time) { showNoticeModal("Select date and time"); return }
    if (!form.reason.trim() || !form.emergencyName || !form.emergencyNo) { showNoticeModal("Complete required fields"); return }
    if (!form.consent1 || !form.consent2) { showNoticeModal("Agree to consent statements"); return }
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
      const res = await fetch(`${BASE}/appointments/create_appointment.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: realStudentId, student_info: studentInfo, first_name: firstName, last_name: lastName, course, year_level: yearLevel, preferred_day: form.date, appointment_date: form.date, preferred_time: form.time, consultation_hour: form.time, counselor_name: COUNSELORS[form.counselor]?.name || 'To be assigned', reason: form.reason, status: 'Pending', urgency_level: urgency, emergency_contact_name: form.emergencyName, emergency_contact_relation: form.emergencyRel, emergency_contact_no: form.emergencyNo, }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Booking failed')
      showNoticeModal(`Booked as ${data.student_info || studentInfo}`, "success")
      setForm(f => ({ ...f, date: '', time: '', reason: '', emergencyName: '', emergencyRel: '', emergencyNo: '' }))
      setUrgency('Normal'); setEmergencyAgreed(false)
    } catch (err) { showNoticeModal(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="bg-[#f6f8f7] w-full">
      <div className="bg-[#085041] px-6 md:px-10 py-8 flex flex-col lg:flex-row gap-6 justify-between">
        <div>
          <h2 className="text-[28px] font-semibold text-white leading-tight">Counseling Request Form</h2>
          <p className="text-[12px] text-white/60 mt-3">Official GCO Imus Form <span className="mx-1.5 text-white/30">|</span> Mon to Thurs only, 7AM to 4PM</p>
        </div>
      </div>
      <div className="px-4 md:px-10 py-6 max-w-[760px] mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {/* Counselor */}
          <p className="text-[12px] font-semibold">Select Counselor</p>
          {loadingCounsellors ? (
            <div className="mt-3 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center"><p className="text-[12px] text-gray-500">Loading counselors...</p></div>
          ) : COUNSELORS.length === 0 ? (
            <div className="mt-3 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
              <p className="text-[12px] text-gray-500">No counselor assigned yet. Your request will be assigned by GCO.</p>
              <p className="text-[11px] text-gray-400 mt-1">Counselor list will be added later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {COUNSELORS.map((c, i) => (
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

          {/* Date */}
          <Section title="Date">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {weekdays.map((d, i) => { const iso = d.toISOString().split('T')[0]; const isSel = iso === form.date; return ( <button key={i} onClick={() => { set('date', iso); set('time', '') }} className={`min-w-[68px] rounded-xl border px-3 py-2 text-center transition-colors ${isSel ? 'bg-[#085041] text-white border-[#085041]' : 'bg-[#f6f8f7] border-gray-200'}`}> <p className="text-[10px] uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p> <p className="text-[16px] font-semibold">{d.getDate()}</p> </button> ) })}
            </div>
          </Section>

          {/* Time */}
          <Section title="Time">
            {!form.date ? <p className="text-[12px] text-gray-400">Select a date first</p> : ( <div className="grid grid-cols-2 md:grid-cols-4 gap-2"> {availableSlots.map(t => ( <button key={t.label} onClick={() => set('time', t.label)} className={`py-2.5 rounded-xl border text-[12px] font-medium transition-colors ${form.time === t.label ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white border-gray-200'}`}>{t.label}</button> ))} </div> )}
          </Section>

          {/* Reason */}
          <Section title="Reason">
            <textarea value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Academic, Career, Psychological..." className={inputCls + " h-20 resize-none"} />
          </Section>

          {/* Urgency */}
          <Section title={<>Urgency Level <span className="text-red-500">*</span></>}>
            <select value={urgency} onChange={e => handleUrgencyChange(e.target.value)} className={inputCls}>
              {URGENCY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {urgency === 'Emergency' && <p className="text-[11px] text-red-600 font-medium mt-2">This will notify admin immediately as URGENT. Please read the Emergency Disclaimer.</p>}
            {urgency === 'Urgent' && <p className="text-[11px] text-orange-600 mt-2">Admin will prioritize this within 24-48 hours.</p>}
          </Section>

          {/* Emergency Contact */}
          <div className="mt-6 border-t pt-6">
            <p className="text-[12px] font-medium">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <input value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="Full name" className={inputCls + " col-span-2"} />
              <input value={form.emergencyRel} onChange={e => set('emergencyRel', e.target.value)} placeholder="Relation" className={inputCls} />
              <input value={form.emergencyNo} onChange={e => set('emergencyNo', e.target.value)} placeholder="Contact number" className={inputCls + " col-span-3"} />
            </div>
          </div>

          {/* Consent */}
          <div className="mt-6 space-y-2">
            <label className="flex gap-2 text-[11px]"><input type="checkbox" checked={form.consent1} onChange={e => set('consent1', e.target.checked)} /> I consent to GCO keeping records of my session</label>
            <label className="flex gap-2 text-[11px]"><input type="checkbox" checked={form.consent2} onChange={e => set('consent2', e.target.checked)} /> I understand confidentiality under DPA 2012</label>
          </div>
          <button onClick={handleBook} disabled={loading} className="w-full mt-6 bg-[#085041] text-white font-medium py-3 rounded-full text-[13px]">{loading ? 'Booking...' : urgency === 'Emergency' ? '🚨 Send Emergency Request' : 'Confirm Booking'}</button>
          <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-3">*LIMITATION: If life and death situation, please contact nearest hospital <span className="mx-1 text-gray-300">|</span> NCMH Crisis Hotline 1553 <span className="mx-1 text-gray-300">|</span> 911 immediately. This portal is monitored only during school hours (Mon-Thurs, 7AM-4PM).</p>
        </div>
      </div>

      {/* Emergency Disclaimer */}
      {showEmergencyModal && (
        <Modal>
          <h2 className="text-[16px] font-bold text-red-600">⚠️ Emergency Disclaimer</h2>
          <div className="text-[12px] text-gray-600 mt-3 leading-relaxed space-y-2">
            <p>You selected <b>Emergency - Need help now</b>.</p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <b>If this is life-threatening:</b><br /> Call nearest hospital <Divider /> 911<br /> NCMH Crisis Hotline: <b>1553</b><br /> <span className="flex items-center gap-2 mt-1">Smart: 0919-057-1553 <Divider /> Globe: 0917-899-8727</span><br /> <b>School Hours:</b> Mon-Thurs 7AM-4PM only<br /> Severe cases may be referred to external professionals / hospital.
            </div>
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
        </Modal>
      )}

      {/* Notice */}
      {notice.show && (
        <Modal>
          <h3 className="text-[13px] font-semibold">{notice.type === 'success' ? 'Success' : 'Notice'}</h3>
          <p className="text-[12px] text-gray-600 mt-2">{notice.msg}</p>
          <button onClick={() => setNotice(n => ({ ...n, show: false }))} className="w-full mt-4 py-2.5 rounded-full bg-[#085041] text-white text-[12px]">Close</button>
        </Modal>
      )}
      <CvsuPortalModal open={showPortal} onClose={() => setShowPortal(false)} />
    </div>
  )
}