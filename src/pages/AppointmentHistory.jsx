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
  const [loading, setLoading] = useState(true)
  const [showNotice, setShowNotice] = useState(false)
  const [noticeMsg, setNoticeMsg] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/appointments')
        const data = await res.json()
        // yung data mo is array mismo
        setHistory(data.reverse())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to cancel')
      setHistory(prev => prev.map(h => h.id === id? {...h, status: 'Cancelled'} : h))
      setNoticeMsg("Your appointment has been successfully cancelled.")
      setShowNotice(true)
      if (showToast) showToast('Appointment cancelled')
    } catch (err) {
      setNoticeMsg(err.message)
      setShowNotice(true)
    }
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
        <span className="text-[12px] text-gray-500">{history.length} record{history.length!==1 && 's'}</span>
      </div>

      {loading? <p className="text-[14px] text-gray-500 text-center">Loading...</p> : history.length === 0? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-[14px] text-gray-500">No appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-bold text-gray-900">GCO-{item.id} • New Appointment</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{new Date(item.created_at).toLocaleString()} • Booked</p>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}>{item.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px] mb-3">
                <div><p className="text-gray-400 text-[11px]">Date & Day</p><p className="font-semibold text-gray-800">{new Date(item.appointment_date).toLocaleDateString()}</p></div>
                <div><p className="text-gray-400 text-[11px]">Time</p><p className="font-semibold text-gray-800">{item.consultation_hour}</p></div>
                <div className="col-span-2"><p className="text-gray-400 text-[11px]">Counselor</p><p className="font-semibold text-gray-800">{item.counselor_name}</p></div>
                <div className="col-span-2"><p className="text-gray-400 text-[11px]">Reason</p><p className="font-semibold text-gray-800">{item.reason}</p></div>
              </div>
              {item.status === 'Pending' && (
                <button onClick={() => cancelBooking(item.id)} className="w-full mt-2 bg-white border border-red-200 text-red-600 text-[13px] font-semibold py-2.5 rounded-full hover:bg-red-50">Cancel Appointment</button>
              )}
            </div>
          ))}
        </div>
      )}

      {showNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl p-5 max-w-[340px] w-full border-t-4 border-green-600">
            <h3 className="font-bold text-[15px] text-green-700">Notice</h3>
            <p className="text-[13px] text-gray-700 mt-2">{noticeMsg}</p>
            <button onClick={() => setShowNotice(false)} className="w-full mt-4 py-2.5 rounded-full bg-green-600 text-white font-bold text-[13px]">OK</button>
          </div>
        </div>
      )}
    </div>
  )
}