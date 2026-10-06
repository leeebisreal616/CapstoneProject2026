import { useState, useMemo } from 'react'

// --- MOCK DATA (simulates CvSU portal session) ---
const mockStudent = {
  name: "Aaron Valencia",
  studentNo: "202311325",
  email: "aaron.valencia@cvsu.edu.ph",
  course: "BSIT",
  year: "3rd Year",
  section: "BSIT 3-1",
  contact: "09XX-XXX-XXXX"
}

const COUNSELORS_COUNT = 2
const SESSION_DURATION = "1 Hour"

const mockBookedSlotsByDay = {
  "Monday": ["8:00 AM - 9:00 AM", "1:00 PM - 2:00 PM"],
  "Tuesday": [],
  "Wednesday": ["10:00 AM - 11:00 AM"],
  "Thursday": ["8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM"],
  "Friday": ["9:00 AM - 10:00 AM"]
}

const allTimeSlots = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM"
]

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function Counseling() {
  const [form, setForm] = useState({
    appointmentType: "new",
    followupDetails: "",
    reason: [],
    otherReason: "",
    preferredDay: "",
    preferredTime: "",
    counselorGender: "",
    language: "",
    followupNeeded: false,
    followupDay: "",
    followupTime: "",
    emergencyName: "",
    emergencyContact: "",
    emergencyRelation: "",
    consent: false
  })

  const [submitted, setSubmitted] = useState(false)

  const availableTimes = useMemo(() => {
    if (!form.preferredDay) return []
    const booked = mockBookedSlotsByDay[form.preferredDay] || []
    return allTimeSlots.filter(t =>!booked.includes(t))
  }, [form.preferredDay])

  const availableFollowupTimes = useMemo(() => {
    if (!form.followupDay) return []
    const booked = mockBookedSlotsByDay[form.followupDay] || []
    return allTimeSlots.filter(t =>!booked.includes(t))
  }, [form.followupDay])

  const handleReason = (r) => {
    setForm(prev => ({
     ...prev,
      reason: prev.reason.includes(r)? prev.reason.filter(x => x!== r) : [...prev.reason, r]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.consent) return alert("Please accept consent")
    if (!form.preferredDay ||!form.preferredTime) return alert("Please select day and time")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6faf8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-[#d1e5de] text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">✓</div>
          <h2 className="text-xl font-bold text-[#0F6A4E]">Appointment Booked!</h2>
          <p className="text-sm text-gray-600 mt-2">Your appointment for {form.preferredDay}, {form.preferredTime} ({SESSION_DURATION}) has been submitted. Admin will review it.</p>
          {form.followupNeeded && <p className="text-xs text-gray-500 mt-2">Follow-up preference: {form.followupDay} {form.followupTime}</p>}
          <button onClick={() => setSubmitted(false)} className="mt-6 w-full bg-[#0F6A4E] text-white py-3 rounded-xl text-sm">Back to Book Appointment</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6faf8] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d1e5de] p-5 sm:p-7">
          <h1 className="text-2xl font-bold text-[#0F6A4E]">Book Appointment</h1>
          <p className="text-sm text-gray-600 mt-1">Fill out the form below. Max 1 booking per day per student. Session duration is fixed to 1 hour.</p>

          <div className="mt-6 bg-[#f0f7f4] border border-[#d1e5de] rounded-xl p-4 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-[#0F6A4E] text-white flex items-center justify-center font-bold">AV</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{mockStudent.name}</p>
              <p className="text-xs text-gray-600">{mockStudent.studentNo} • {mockStudent.course} {mockStudent.year}</p>
              <p className="text-xs text-gray-500">{mockStudent.email}</p>
            </div>
            <div className="text-[10px] bg-white border border-[#d1e5de] px-2 py-1 rounded-full">Auto-filled from CvSU Portal</div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-800">Appointment Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className={`border rounded-xl p-3 text-sm cursor-pointer ${form.appointmentType === 'new'? 'border-[#0F6A4E] bg-[#f0f7f4]' : 'border-[#d1e5de]'}`}>
                  <input type="radio" name="type" value="new" checked={form.appointmentType === 'new'} onChange={() => setForm({...form, appointmentType: 'new'})} className="mr-2" /> New Consultation
                </label>
                <label className={`border rounded-xl p-3 text-sm cursor-pointer ${form.appointmentType === 'followup'? 'border-[#0F6A4E] bg-[#f0f7f4]' : 'border-[#d1e5de]'}`}>
                  <input type="radio" name="type" value="followup" checked={form.appointmentType === 'followup'} onChange={() => setForm({...form, appointmentType: 'followup'})} className="mr-2" /> Follow-up Session
                </label>
              </div>
              {form.appointmentType === 'followup' && (
                <input placeholder="Previous session date / reference (optional)" value={form.followupDetails} onChange={e => setForm({...form, followupDetails: e.target.value})} className="mt-3 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#0F6A4E]" />
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-800">Reason for Counseling</label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {["Academic Concerns", "Personal Issues", "Career Guidance", "Mental Health", "Family Concerns", "Others"].map(r => (
                  <label key={r} className="flex items-center gap-2 text-sm border border-[#d1e5de] rounded-xl px-3 py-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.reason.includes(r)} onChange={() => handleReason(r)} /> {r}
                  </label>
                ))}
              </div>
              {form.reason.includes("Others") && (
                <input placeholder="Please specify" value={form.otherReason} onChange={e => setForm({...form, otherReason: e.target.value})} className="mt-2 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#0F6A4E]" />
              )}
            </div>

            <div className="border border-[#d1e5de] rounded-xl p-4 bg-[#fcfdfc]">
              <h3 className="text-sm font-semibold text-gray-800">Preferred Schedule</h3>
              <div className="mt-1 flex gap-2 text-[11px]">
                <span className="bg-[#0F6A4E] text-white px-2 py-1 rounded-full">Duration: {SESSION_DURATION}</span>
                <span className="bg-white border border-[#d1e5de] px-2 py-1 rounded-full">Counselors Available: {COUNSELORS_COUNT}</span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700">Preferred Day (choose one)</label>
                  <select value={form.preferredDay} onChange={e => setForm({...form, preferredDay: e.target.value, preferredTime: ""})} className="mt-1 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm bg-white outline-none focus:border-[#0F6A4E]">
                    <option value="">Select day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Preferred Time (choose one)</label>
                  <select value={form.preferredTime} onChange={e => setForm({...form, preferredTime: e.target.value})} disabled={!form.preferredDay} className="mt-1 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm bg-white outline-none focus:border-[#0F6A4E] disabled:bg-gray-50">
                    <option value="">{!form.preferredDay? "Select day first" : availableTimes.length === 0? "No available slots" : "Select time"}</option>
                    {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {form.preferredDay && availableTimes.length === 0 && (
                    <p className="text-[11px] text-red-600 mt-1">All slots booked for {form.preferredDay}. Please choose another day.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#0F6A4E]/40 rounded-xl p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                <input type="checkbox" checked={form.followupNeeded} onChange={e => setForm({...form, followupNeeded: e.target.checked})} />
                Need Follow-up Counseling? (Let us know when you're free)
              </label>
              {form.followupNeeded && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-700">Free Day for Follow-up</label>
                    <select value={form.followupDay} onChange={e => setForm({...form, followupDay: e.target.value, followupTime: ""})} className="mt-1 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm bg-white outline-none">
                      <option value="">Select free day</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700">Free Time for Follow-up</label>
                    <select value={form.followupTime} onChange={e => setForm({...form, followupTime: e.target.value})} disabled={!form.followupDay} className="mt-1 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm bg-white outline-none disabled:bg-gray-50">
                      <option value="">{!form.followupDay? "Select day first" : "Select time"}</option>
                      {availableFollowupTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700">Preferred Counselor Gender (optional)</label>
                <select value={form.counselorGender} onChange={e => setForm({...form, counselorGender: e.target.value})} className="mt-1 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm bg-white outline-none">
                  <option value="">No preference</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Preferred Language</label>
                <select value={form.language} onChange={e => setForm({...form, language: e.target.value})} className="mt-1 w-full border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm bg-white outline-none">
                  <option value="">Select</option>
                  <option value="english">English</option>
                  <option value="filipino">Filipino</option>
                  <option value="taglish">Taglish</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input placeholder="Emergency Contact Name" value={form.emergencyName} onChange={e => setForm({...form, emergencyName: e.target.value})} className="border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#0F6A4E]" />
              <input placeholder="Contact Number" value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} className="border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#0F6A4E]" />
              <input placeholder="Relationship" value={form.emergencyRelation} onChange={e => setForm({...form, emergencyRelation: e.target.value})} className="border border-[#d1e5de] rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#0F6A4E]" />
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={form.consent} onChange={e => setForm({...form, consent: e.target.checked})} className="mt-0.5" />
              I consent to the processing of my data for counseling purposes in accordance with RA 10173 Data Privacy Act.
            </label>

            <button type="submit" className="w-full bg-[#0F6A4E] text-white py-3.5 rounded-xl font-semibold text-sm">Submit Appointment Request</button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#d1e5de] p-5">
            <h4 className="text-sm font-bold text-[#0F6A4E]">Office Hours</h4>
            <p className="text-xs text-gray-600 mt-1">Monday - Friday, 8:00 AM - 5:00 PM</p>
            <p className="text-[11px] text-gray-500 mt-2">GCO Location: Admin Building, CvSU Imus</p>
          </div>
        </div>
      </div>
    </div>
  )
}