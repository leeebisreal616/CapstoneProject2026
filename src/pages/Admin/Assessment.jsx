/* ============ ASSESSMENT RESULTS - HOME DESIGN SYSTEM ============ */
import { useState, useEffect } from 'react'
const BASE = 'http://localhost/gco-api'

function FlagBadge({ flag }) {
  const map = {
    urgent: { text: 'Needs Attention', cls: 'bg-red-50 text-red-700 border-red-200' },
    watch: { text: 'Monitor', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    normal: { text: 'Normal', cls: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]' },
    high: { text: 'Needs Attention', cls: 'bg-red-50 text-red-700 border-red-200' },
    moderate: { text: 'Monitor', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { text: 'Normal', cls: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]' },
  }
  const key = (flag || 'normal').toLowerCase()
  const f = map[key] || map.normal
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${f.cls}`}>{f.text}</span>
}

const Icon = {
  assessment: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

export default function AssessmentResults() {
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const filters = ['all', 'urgent', 'watch', 'normal']

  const fetchLive = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/assessment_results/get_results.php`)
      const data = await res.json()
      const rawData = Array.isArray(data) ? data : data.data || data.result || []
      const mapped = rawData.map(row => ({
        id: row.id,
        name: row.student_name || row.name || row.full_name,
        studentId: row.student_id || row.studentId,
        exam: row.exam_type || row.exam || row.test_type || 'Assessment',
        result: row.result || row.score || row.interpretation || row.result_text,
        flag: row.flag || row.status || (row.needs_attention == 1 ? 'urgent' : 'normal'),
        date: row.created_at || row.date || row.submitted_at,
        raw: row,
      }))
      setResults(mapped.sort((a,b) => new Date(b.date) - new Date(a.date)))
    } catch (e) {
      console.error('FETCH ASSESSMENT FAILED', e)
      setResults([])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchLive() }, [])

  const filtered = filter === 'all' ? results : results.filter(r => r.flag.toLowerCase() === filter)

  if (loading) return <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] p-10 text-center text-[13px] text-gray-400">Loading assessment results from gco-api...</div>

  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] flex flex-col p-5 md:p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Assessment Results</h1>
        <p className="text-[13px] text-gray-500 mt-1">Confidential under RA 10173 — LIVE from MySQL</p>
      </div>

      {/* Filters - HOME BUTTON STYLE */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} 
            className={`text-[13px] font-semibold px-5 py-2.5 rounded-full whitespace-nowrap border capitalize transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.98]
            ${filter === f ? 'bg-[#085041] text-white border-[#085041] shadow-[0_4px_12px_rgba(8,80,65,0.2)]' : 'bg-white text-gray-600 border-gray-200 hover:shadow-[0_4px_12px_rgba(8,80,65,0.08)] hover:border-[#085041]/20'}`}>
            {f === 'all' ? `All (${results.length})` : f === 'urgent' ? 'Needs Attention' : f}
          </button>
        ))}
        <button onClick={fetchLive} className="ml-auto bg-white border border-gray-200 text-gray-600 text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-[0_4px_12px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[1px] active:scale-[0.98]">Refresh</button>
      </div>

      {/* Summary Cards - HOME CARD STYLE */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Needs Attention', value: results.filter(r=>r.flag.toLowerCase()==='urgent' || r.flag.toLowerCase()==='high').length, color: '#B91C1C', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'Monitor', value: results.filter(r=>r.flag.toLowerCase()==='watch' || r.flag.toLowerCase()==='moderate').length, color: '#B45309', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Normal', value: results.filter(r=>r.flag.toLowerCase()==='normal' || r.flag.toLowerCase()==='low').length, color: '#085041', bg: 'bg-[#E8F5F1]', border: 'border-[#9FE1CB]' },
        ].map((stat,i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 border border-gray-200 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[1px] cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[22px] font-bold" style={{color: stat.color}}>{stat.value}</p>
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mt-0.5">{stat.label}</p>
              </div>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center transition-all duration-200`} style={{color: stat.color}}>{Icon.assessment('w-4 h-4')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table - HOME CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f6f8f7]">
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Student</th>
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Exam</th>
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Result</th>
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Flag</th>
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#f6f8f7] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.assessment('w-6 h-6')}</div>
                  <p className="text-[13px] text-gray-500">No assessment results yet.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Pag nag-take ng exam student, dito lalabas - walang dummy!</p>
                </td></tr>
              )}
              {filtered.map(e => (
                <tr key={e.id} className={`group transition-all duration-200 hover:bg-[#f6f8f7] ${e.flag.toLowerCase() === 'urgent' || e.flag.toLowerCase() === 'high' ? 'bg-red-50/40 hover:bg-red-50/60' : ''}`}>
                  <td className="px-5 py-4"><p className="text-[13px] font-bold text-gray-900 group-hover:text-[#085041] transition-colors duration-200">{e.name}</p><p className="text-[11px] text-gray-500">{e.studentId}</p></td>
                  <td className="px-5 py-4"><span className="bg-[#f6f8f7] border border-gray-100 text-[11px] font-semibold px-2.5 py-1 rounded-full text-gray-700 group-hover:bg-white group-hover:border-[#085041]/10 group-hover:shadow-[0_2px_8px_rgba(8,80,65,0.06)] transition-all duration-200">{e.exam}</span></td>
                  <td className="px-5 py-4 text-[13px] text-gray-700 max-w-[200px] truncate">{e.result}</td>
                  <td className="px-5 py-4"><FlagBadge flag={e.flag}/></td>
                  <td className="px-5 py-4 text-[12px] text-gray-500">{e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(8,80,65,0.08)] hover:border-[#085041]/10">
        <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">Data Source</p>
        <p className="text-[12px] text-gray-600 leading-relaxed">Live from: <code className="bg-[#f6f8f7] border border-gray-100 px-1.5 py-0.5 rounded text-[11px]">gco-api/assessment_results/get_results.php</code>. Confidential under RA 10173. Walang dummy data.</p>
      </div>
    </div>
  )
}