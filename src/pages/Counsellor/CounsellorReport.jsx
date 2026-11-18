import { useEffect, useState, useCallback } from 'react'

const BASE = 'http://localhost/gco-api'

function formatDate(d) {
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  return dt.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

function normalizeUrgency(v) {
  const s = String(v || '').toLowerCase().trim()
  if (s.includes('emerg')) return 'Emergency'
  if (s.includes('urgent')) return 'Urgent'
  return 'Normal'
}

function Bar({ label, value, max, color }) {
  const pct = max ? Math.max((value / max) * 100, value > 0 ? 12 : 0) : 0
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-[110px] text-[12px] truncate text-gray-600 font-medium">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-[22px] overflow-hidden">
        <div className="h-full rounded-full flex items-center justify-end pr-2 text-[11px] font-bold text-white transition-all" style={{ width: `${pct}%`, background: color, minWidth: value > 0 ? '32px' : '0' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default function AdminReport() {
  const [r, setR] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setPageError('')
    try {
      const res = await fetch(`${BASE}/appointments/get_report.php`)
      const data = await res.json()
      setR(data)
    } catch (e) {
      setR(null)
      setPageError('Cannot connect to server. Check if XAMPP (Apache) is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReport() }, [fetchReport])

  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading report...</div>

  if (!r) return (
    <div className="p-6">
      <p className="text-[13px] text-gray-500">Failed to load report.</p>
      {pageError && <p className="text-[12.5px] text-red-600 mt-2">{pageError}</p>}
      <button onClick={fetchReport} className="mt-4 bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full">Try Again</button>
    </div>
  )

  const byMonth = r.by_month || []
  const byConcern = r.by_concern || []
  const byStatus = r.by_status || []
  const byCounselor = r.by_counselor || []
  const byUrgencyRaw = r.by_urgency || []

  const byUrgency = byUrgencyRaw.map(x => ({
    ...x,
    urgency_level: normalizeUrgency(x.urgency_level),
    count: Number(x.count) || 0,
  }))

  const maxMonth = Math.max(...byMonth.map(x => +x.count), 1)
  const maxConcern = Math.max(...byConcern.map(x => +x.count), 1)
  const emergencyCount = byUrgency.find(x => x.urgency_level === 'Emergency')?.count || 0
  const urgentCount = byUrgency.find(x => x.urgency_level === 'Urgent')?.count || 0
  const total = Number(r.total || 0)
  const archivedTotal = Number(r.archived_total || 0)

  const concernColor = (reason) => {
    const s = String(reason || '').toLowerCase()
    if (s.includes('psych')) return '#DC2626'
    if (s.includes('acad')) return '#2563EB'
    if (s.includes('career')) return '#3C3489'
    return '#F59E0B'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">GCO Admin Report</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">Generated {formatDate(new Date())} — Active appointments only</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
          <button onClick={() => window.print()} className="bg-[#085041] text-white text-[12px] font-bold px-4 py-2 rounded-full hover:bg-[#06382D]">Print Report</button>
        </div>
      </div>

      {pageError && <div className="bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium px-4 py-2.5 rounded-[14px]">{pageError} <button onClick={() => setPageError('')} className="ml-2 font-bold underline">Dismiss</button></div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Total Active</p><p className="text-[28px] font-extrabold text-gray-900 mt-1 leading-none">{total}</p><p className="text-[11px] text-gray-400 mt-1.5">Not yet archived</p></div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Archived</p><p className="text-[28px] font-extrabold text-gray-900 mt-1 leading-none">{archivedTotal}</p><p className="text-[11px] text-gray-400 mt-1.5">Completed or hidden</p></div>
        <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold tracking-wider text-red-500 uppercase">Emergency</p><p className="text-[28px] font-extrabold text-red-600 mt-1 leading-none">{emergencyCount}</p><p className="text-[11px] text-red-400 mt-1.5">Needs immediate action</p></div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Urgent</p><p className="text-[28px] font-extrabold text-orange-600 mt-1 leading-none">{urgentCount}</p><p className="text-[11px] text-gray-400 mt-1.5">Within 24-48 hrs</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="font-bold text-[14px] text-gray-900">Appointments per Month</h3>
          <p className="text-[11px] text-gray-500 mb-3">Shows peak season for counseling appointments.</p>
          {byMonth.length === 0 && <p className="text-[12px] text-gray-400 py-4 text-center">No data yet</p>}
          {byMonth.map((x, i) => (<Bar key={i} label={x.month} value={+x.count} max={maxMonth} color="#085041" />))}
        </div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="font-bold text-[14px] text-gray-900">By Concern / Reason</h3>
          <p className="text-[11px] text-gray-500 mb-3">Most common reasons for counseling.</p>
          {byConcern.length === 0 && <p className="text-[12px] text-gray-400 py-4 text-center">No data yet</p>}
          {byConcern.map((x, i) => (<Bar key={i} label={x.reason} value={+x.count} max={maxConcern} color={concernColor(x.reason)} />))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="font-bold text-[14px] text-gray-900 mb-3">By Status</h3>
          {byStatus.length === 0 && <p className="text-[12px] text-gray-400">No data yet</p>}
          {byStatus.map((x, i) => (
            <div key={i} className="flex justify-between items-center text-[12px] py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-600 capitalize">{x.status}</span>
              <span className="font-bold text-[13px]">{x.count}</span>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="font-bold text-[14px] text-gray-900 mb-3">By Counselor</h3>
          {byCounselor.length === 0 && <p className="text-[12px] text-gray-400">No data yet</p>}
          {byCounselor.map((x, i) => (
            <div key={i} className="flex justify-between items-center text-[12px] py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-600 truncate mr-2">{x.counselor_name || 'Unassigned'}</span>
              <span className="font-bold text-[13px] shrink-0">{x.count}</span>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="font-bold text-[14px] text-gray-900 mb-3">By Urgency</h3>
          {byUrgency.length === 0 && <p className="text-[12px] text-gray-400">No data yet</p>}
          {byUrgency.map((x, i) => (
            <div key={i} className="flex justify-between items-center text-[12px] py-1.5 border-b border-gray-50 last:border-0">
              <span className={`font-medium ${x.urgency_level === 'Emergency' ? 'text-red-600 font-bold' : x.urgency_level === 'Urgent' ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                {x.urgency_level}
              </span>
              <span className="font-bold text-[13px]">{x.count}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center">Total — Active only, excluding Archived — Use Print Report for the monthly report.</p>
    </div>
  )
}