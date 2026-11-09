import { useEffect, useState } from 'react'
const BASE = 'http://localhost/gco-api'

function Bar({ label, value, max, color }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-[110px] text-[12px] truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-[22px] overflow-hidden">
        <div
          className="h-full rounded-full flex items-center justify-end pr-2 text-[11px] font-bold text-white"
          style={{ width: `${max ? (value / max) * 100 : 0}%`, background: color, minWidth: value > 0 ? '32px' : '0' }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

export default function AdminReport() {
  const [r, setR] = useState(null)

  useEffect(() => {
    fetch(`${BASE}/appointments/get_report.php`)
      .then(res => res.json())
      .then(setR)
  }, [])

  if (!r) return <p className="p-6 text-[13px]">Loading report...</p>

  const maxMonth = Math.max(...r.by_month.map(x => +x.count), 1)
  const maxConcern = Math.max(...r.by_concern.map(x => +x.count), 1)

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      <h2 className="text-[20px] font-bold">📊 GCO Admin Report</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-[11px] text-gray-500">Total Active</p>
          <p className="text-[28px] font-bold">{r.total}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-[11px] text-gray-500">Archived</p>
          <p className="text-[28px] font-bold">{r.archived_total}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-[11px] text-red-600">Emergency</p>
          <p className="text-[28px] font-bold text-red-600">{r.by_urgency.find(x => x.urgency_level === 'Emergency')?.count || 0}</p>
        </div>
      </div>

      {/* Bar Graph - Per Month */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-[14px]">Appointments per Month</h3>
        <p className="text-[11px] text-gray-500 mb-3">Best para makita kung kailan peak season ng counseling</p>
        {r.by_month.length === 0 && <p className="text-[12px] text-gray-400">No data yet</p>}
        {r.by_month.map((x, i) => (
          <Bar key={i} label={x.month} value={+x.count} max={maxMonth} color="#085041" />
        ))}
      </div>

      {/* Bar Graph - By Concern */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-[14px]">By Concern / Reason</h3>
        {r.by_concern.map((x, i) => (
          <Bar
            key={i}
            label={x.reason}
            value={+x.count}
            max={maxConcern}
            color={x.reason === 'Psychological' ? '#DC2626' : x.reason === 'Academic' ? '#2563EB' : '#F59E0B'}
          />
        ))}
      </div>

      {/* By Status + By Counselor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-[14px] mb-2">By Status</h3>
          {r.by_status.map((x, i) => (
            <div key={i} className="flex justify-between text-[12px] py-1">
              <span>{x.status}</span><b>{x.count}</b>
            </div>
          ))}
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-[14px] mb-2">By Counselor</h3>
          {r.by_counselor.map((x, i) => (
            <div key={i} className="flex justify-between text-[12px] py-1">
              <span>{x.counselor_name}</span><b>{x.count}</b>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => window.print()} className="w-full bg-[#085041] text-white py-3 rounded-full text-[13px]">
        🖨️ Print Report
      </button>
    </div>
  )
}