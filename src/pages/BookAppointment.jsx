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
  const [counselorPref, setCounselorPref] = useState('')
  const [langPref, setLangPref] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRel, setEmergencyRel] = useState('')
  const [emergencyNo, setEmergencyNo] = useState('')
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const counselors = [
    { name: "Jervin D. Quicho", role: "GCO Head - Imus", avail: "Mon-Fri Only", initial: "JQ" },
    { name: "Hazel Grace B. Malayo", role: "GCO Staff - Imus", avail: "Mon-Fri Only", initial: "HM" }
  ]

  const allSlots = [
    { label: "7AM-8AM", hour24: 7 }, { label: "8AM-9AM", hour24: 8 },
    { label: "9AM-10AM", hour24: 9 }, { label: "10AM-11AM", hour24: 10 },
    { label: "11AM-12PM", hour24: 11 }, { label: "1PM-2PM", hour24: 13 },
    { label: "2PM-3PM", hour24: 14 }, { label: "3PM-4PM", hour24: 15 },
  ]

  // FIXED DOWNLOAD - hindi na HTML
  const handleDownload = async () => {
    try {
      const res = await fetch('/forms/counseling-request-form.pdf');
      if(!res.ok) throw new Error('File not found in public/forms/');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Counseling_Request_Form_GCO_Imus.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showNoticeModal('Ilagay mo muna PDF sa public/forms/Counseling_Request_Form_final.pdf - ' + err.message);
    }
  };

  const showNoticeModal = (msg, type='error') => { setNoticeMsg(msg); setNoticeType(type); setShowNotice(true) }
  const isWeekend = (dateStr) => { if (!dateStr) return false; const d = new Date(dateStr); return d.getDay()===0 || d.getDay()===6 }
  const isToday = (dateStr) => dateStr === new Date().toISOString().split('T')[0]
  const getAvailableSlots = () => {
    if (!selectedDate) return []
    if (isWeekend(selectedDate)) return []
    if (!isToday(selectedDate)) return allSlots
    const currentHour = new Date().getHours()
    return allSlots.filter(s => s.hour24 > currentHour)
  }
  const getNextWeekdays = () => {
    const days = []; let d = new Date()
    while (days.length < 10) { if (d.getDay()!==0 && d.getDay()!==6) days.push(new Date(d)); d.setDate(d.getDate()+1) }
    return days
  }

  const handleBook = async () => {
    if (!selectedDate ||!selectedTime) { showNoticeModal("Please select both date and time."); return }
    if (isWeekend(selectedDate)) { showNoticeModal("Cannot book on weekends - Mon-Fri only."); return }
    if (!reason.trim() ||!emergencyName ||!emergencyNo) { showNoticeModal("Please complete all required fields including Emergency Contact."); return }
    if (!consent1 ||!consent2) { showNoticeModal("You must agree to both consent statements."); return }
    setLoading(true)
    try {
      const payload = {
        appointment_date: selectedDate,
        consultation_hour: selectedTime,
        counselor_name: counselors[selectedCounselor].name,
        counselor_pref: counselorPref,
        language_pref: langPref,
        reason,
        emergency_contact: { name: emergencyName, rel: emergencyRel, no: emergencyNo },
        student_info: "Aaron Valencia - 202311325 - BSIT 4th Year",
        status: "Pending"
      }
      const res = await fetch('http://localhost:3001/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Booking failed')
      showNoticeModal("Your counseling request has been successfully booked and saved to GCO databank.", "success")
      setSelectedDate(''); setSelectedTime(''); setReason(''); setEmergencyName(''); setEmergencyRel(''); setEmergencyNo('')
    } catch (err) { showNoticeModal(err.message) } finally { setLoading(false) }
  }

  const availableSlots = getAvailableSlots()
  const weekdays = getNextWeekdays()

  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)]">
      <div className="bg-[#085041] px-6 md:px-10 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
        <div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-[0.95] tracking-tight">Counseling Request Form</h2>
          <p className="text-[13px] text-white/70 mt-3 max-w-[460px]">Official GCO Imus Form - Patterned from Ma'am Hazel file. Mon-Fri only, 7AM-4PM.</p>
          <div className="mt-4 flex gap-2">
            {/* ISANG BUTTON NA LANG */}
            <button onClick={handleDownload} className="text-[11px] bg-white text-[#085041] px-4 py-2 rounded-full font-bold hover:bg-gray-100">
              Download Blank PDF ↓
            </button>
          </div>
        </div>
        <div className="w-full lg:w-[360px] bg-[#0a5a49] border border-white/10 rounded-2xl p-5">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-2">SCHEDULING INFO</p>
          <p className="text-[12px] text-white/70 leading-relaxed">Mon-Fri Only • 7AM-4PM fixed<br/>Official form with consent & DPA 10173<br/>For Oct 26 Mock Defense - 90% Working</p>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 max-w-[760px] mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-[12px] font-bold">Select Counselor</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {counselors.map((c,i)=>(
              <button key={i} onClick={()=>setSelectedCounselor(i)} className={`p-4 rounded-xl border-2 flex gap-3 items-center text-left ${selectedCounselor===i?'border-[#085041] bg-[#E8F5F1]':'border-gray-200'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] ${selectedCounselor===i?'bg-[#085041] text-white':'bg-gray-100'}`}>{c.initial}</div>
                <div><p className="text-[12px] font-bold">{c.name}</p><p className="text-[10px] text-gray-500">{c.role}</p></div>
              </button>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div><label className="text-[12px] font-bold">Counselor Gender Pref</label><select value={counselorPref} onChange={e=>setCounselorPref(e.target.value)} className="w-full mt-1 bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px]"><option value="">Select</option><option>Female</option><option>Male</option></select></div>
            <div><label className="text-[12px] font-bold">Language Pref</label><select value={langPref} onChange={e=>setLangPref(e.target.value)} className="w-full mt-1 bg-[#f6f8f7] border border-gray-200 rounded-xl px-3 py-2.5 text-[12px]"><option value="">Select</option><option>English</option><option>Filipino</option><option>English/Filipino</option></select></div>
          </div>
          <div className="mt-7">
            <label className="text-[12px] font-bold">Date (Mon-Fri Only)</label>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {weekdays.map((d,i)=>{
                const iso = d.toISOString().split('T')[0]
                const isSel = iso===selectedDate
                return (<button key={i} onClick={()=>{setSelectedDate(iso); setSelectedTime(''); setShowCalendar(false)}} className={`min-w-[72px] rounded-xl border px-3 py-2.5 text-center ${isSel?'bg-[#085041] text-white border-[#085041]':'bg-[#f6f8f7] border-gray-200'}`}><p className="text-[10px] font-bold uppercase opacity-70">{d.toLocaleDateString('en-US',{weekday:'short'})}</p><p className="text-[16px] font-bold leading-none mt-1">{d.getDate()}</p><p className="text-[10px] mt-1 opacity-70">{d.toLocaleDateString('en-US',{month:'short'})}</p></button>)
              })}
            </div>
            <button onClick={()=>setShowCalendar(!showCalendar)} className="text-[11px] text-[#085041] font-bold mt-2">Or pick from calendar →</button>
            {showCalendar && <div className="mt-3 bg-[#f6f8f7] border rounded-xl p-3"><input type="date" value={selectedDate} onChange={e=>{const val=e.target.value; if(isWeekend(val)){showNoticeModal("Weekends closed."); return} setSelectedDate(val); setSelectedTime(''); setShowCalendar(false)}} min={new Date().toISOString().split('T')[0]} className="w-full bg-white border rounded-lg px-3 py-2.5 text-[13px]"/></div>}
          </div>
          <div className="mt-6">
            <label className="text-[12px] font-bold">Time (7AM-4PM)</label>
            {!selectedDate? <p className="text-[12px] text-gray-400 mt-3 bg-gray-50 p-3 rounded-xl">Select a date first</p> : availableSlots.length===0? <p className="text-[12px] text-red-600 mt-3 bg-red-50 p-3 rounded-xl">No slots left today.</p> : <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3">{availableSlots.map((t,i)=>(<button key={i} onClick={()=>setSelectedTime(t.label)} className={`py-3 rounded-xl border text-[12px] font-bold ${selectedTime===t.label?'bg-[#085041] text-white border-[#085041]':'bg-white border-gray-200'}`}>{t.label}</button>))}</div>}
          </div>
          <div className="mt-6"><label className="text-[12px] font-bold">Reason for seeking counseling (required)</label><div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">{["Academic","Career","Psychological","Interpersonal/Relationship","Family","Emotional","Physical","Work Related"].map(r=><label key={r} className="flex gap-2 items-center"><input type="checkbox" onChange={e=>{if(e.target.checked) setReason(prev=> prev? prev+", "+r : r)}}/> {r}</label>)}</div><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Add details..." className="w-full mt-3 bg-[#f6f8f7] border border-gray-200 rounded-xl px-4 py-3 text-[13px] h-20"/></div>
          <div className="mt-6 border-t pt-6">
            <p className="text-[12px] font-bold">Emergency Contact (required)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="md:col-span-2"><input value={emergencyName} onChange={e=>setEmergencyName(e.target.value)} placeholder="Full name" className="w-full bg-[#f6f8f7] border rounded-xl px-3 py-2.5 text-[12px]"/></div>
              <div><input value={emergencyRel} onChange={e=>setEmergencyRel(e.target.value)} placeholder="Relationship" className="w-full bg-[#f6f8f7] border rounded-xl px-3 py-2.5 text-[12px]"/></div>
              <div className="md:col-span-3"><input value={emergencyNo} onChange={e=>setEmergencyNo(e.target.value)} placeholder="Contact Number" className="w-full bg-[#f6f8f7] border rounded-xl px-3 py-2.5 text-[12px]"/></div>
            </div>
          </div>
          <div className="mt-6 border-t pt-6 space-y-2">
            <p className="text-[12px] font-bold">Consent (DPA 2012)</p>
            <label className="flex gap-2 text-[11px]"><input type="checkbox" checked={consent1} onChange={e=>setConsent1(e.target.checked)}/> I consent to GCO keeping records of my session?</label>
            <label className="flex gap-2 text-[11px]"><input type="checkbox" checked={consent2} onChange={e=>setConsent2(e.target.checked)}/> I understand sessions are confidential but may be discussed under legal circumstances?</label>
          </div>
          <button onClick={handleBook} disabled={loading} className="w-full mt-6 bg-[#085041] text-white font-bold py-4 rounded-full text-[14px]">{loading?'Booking...':'Confirm Booking'}</button>
        </div>
      </div>
      {showNotice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-[360px] w-full shadow border border-gray-100"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${noticeType==='success'?'bg-[#E1F5EE] text-[#085041]':'bg-amber-100 text-amber-700'}`}>{noticeType==='success'?'✓':'!'}</div><h3 className="font-bold text-[16px] mt-4">{noticeType==='success'?'Booked Successfully':'Notice'}</h3><p className="text-[13px] text-gray-600 mt-2">{noticeMsg}</p><button onClick={()=>setShowNotice(false)} className="w-full mt-5 py-3 rounded-full bg-[#085041] text-white font-bold text-[13px]">Got it</button></div>
        </div>
      )}
      <CvsuPortalModal open={showPortal} onClose={()=>setShowPortal(false)} />
    </div>
  )
}