import { useState, useEffect } from 'react'

const MOCK_STUDENT = {
  name: 'Aaron Valencia',
  id: '202311325',
  course: 'BSIT 4th Year',
}

const STATUS_STYLES = {
  Pending: 'bg-[#FFF4D6] text-[#8A6D00] border-[#FFE9A8]',
  Approved: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
  Completed: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
  Cancelled: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
}

export default function AppointmentHistory({ showToast }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gco_appointments') || '[]')
    if (saved.length === 0) {
      const seed = [
        {
          id: 'GCO-2026-001',
          date: '2026-05-10',
          day: 'Monday',
          time: '10:00 AM',
          duration: '1 Hour',
          counselor: 'Ms. Santos - Guidance Counselor',
          type: 'New Appointment',
          reason: 'Academic Concerns',
          status: 'Completed',
          followUpNeeded: 'No',
          followUpNotes: '',
          createdAt: '2026-05-08 09:12 AM',
        },
        {
          id: 'GCO-2026-002',
          date: '2026-05-19',
          day: 'Tuesday',
          time: '2:00 PM',
          duration: '1 Hour',
          counselor: 'Mr. Dela Cruz - Guidance Counselor',
          type: 'Follow-up',
          reason: 'Career Guidance',
          status: 'Approved',
          followUpNeeded: 'Yes - Requesting follow-up next week',
          followUpNotes: 'Discussed internship options, need follow-up for OJT requirements',
          createdAt: '2026-05-18 02:30 PM',
        },
        {
          id: 'GCO-2026-003',
          date: '2026-05-26',
          day: 'Monday',
          time: '9:00 AM',
          duration: '1 Hour',
          counselor: 'Ms. Santos - Guidance Counselor',
          type: 'New Appointment',
          reason: 'Personal Concerns',
          status: 'Pending',
          followUpNeeded: 'No',
          followUpNotes: '',
          createdAt: '2026-05-24 11:05 AM',
        },
      ]
      localStorage.setItem('gco_appointments', JSON.stringify(seed))
      setHistory(seed)
    } else {
      setHistory(saved.reverse())
    }
  }, [])

  const cancelBooking = (id) => {
    const updated = history.map((h) => (h.id === id? {...h, status: 'Cancelled' } : h))
    setHistory(updated)
    localStorage.setItem('gco_appointments', JSON.stringify([...updated].reverse()))
    if (showToast) showToast('Appointment cancelled')
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-[800px] mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#085041] flex items-center justify-center text-white font-bold text-[14px]">AV</div>
          <div>
            <p className="text-[14px] font-bold text-gray-900">{MOCK_STUDENT.name} • {MOCK_STUDENT.id}</p>
            <p className="text-[12px] text-gray-500">{MOCK_STUDENT.course}</p>
          </div>
        </div>
        <span className="text-[10px] bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-semibold">Auto-filled from CvSU Portal</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Appointment History</h1>
        <span className="text-[12px] text-gray-500">{history.length} record{history.length!== 1 && 's'}</span>
      </div>

      {history.length === 0? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-[14px] text-gray-500">No appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{item.id} • {item.type}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{item.createdAt} • Booked</p>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}>{item.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px] mb-3">
                <div><p className="text-gray-400 text-[11px]">Date & Day</p><p className="font-semibold text-gray-800">{item.day}, {item.date}</p></div>
                <div><p className="text-gray-400 text-[11px]">Time</p><p className="font-semibold text-gray-800">{item.time} <span className="font-normal text-gray-500">({item.duration})</span></p></div>
                <div className="col-span-2"><p className="text-gray-400 text-[11px]">Counselor</p><p className="font-semibold text-gray-800">{item.counselor}</p></div>
                <div className="col-span-2"><p className="text-gray-400 text-[11px]">Reason</p><p className="font-semibold text-gray-800">{item.reason}</p></div>
                {item.followUpNeeded!== 'No' && (
                  <div className="col-span-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 mt-1">
                    <p className="text-[11px] font-bold text-[#92400E]">Follow-up Request</p>
                    <p className="text-[12px] text-[#78350F] mt-1">{item.followUpNeeded}</p>
                    {item.followUpNotes && <p className="text-[11px] text-gray-600 mt-1 italic">Notes: {item.followUpNotes}</p>}
                  </div>
                )}
              </div>

              {item.status === 'Pending' && (
                <button onClick={() => cancelBooking(item.id)} className="w-full mt-2 bg-white border border-red-200 text-red-600 text-[13px] font-semibold py-2.5 rounded-full hover:bg-red-50 transition">
                  Cancel Appointment
                </button>
              )}
              {item.status === 'Approved' && (
                <div className="mt-2 bg-[#EFF6FF] text-[#1E40AF] text-[11px] px-3 py-2 rounded-full text-center font-medium">
                  Please proceed to GCO Office on {item.date} at {item.time}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}