import { useState, useEffect, useMemo } from 'react'

const BASE = 'http://localhost/gco-api'

function normalizeFlag(v) {
  const s = String(v || '').toLowerCase()
  if (s.includes('urgent') || s.includes('attention') || s.includes('critical') || s.includes('high') || s.includes('severe')) return 'urgent'
  if (s.includes('monitor') || s.includes('watch') || s.includes('moderate')) return 'watch'
  return 'normal'
}

function formatDate(d) {
  if (!d) return 'N/A'
  const dt = new Date(d)
  if (isNaN(dt)) return 'N/A'
  return dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FlagBadge({ flag }) {
  const map = {
    urgent: { text: 'Needs Attention', cls: 'bg-red-50 text-red-700 border-red-200' },
    watch: { text: 'Monitor', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    normal: { text: 'Normal', cls: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]' },
  }
  const f = map[flag] || map.normal
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${f.cls}`}>{f.text}</span>
}

const Icon = {
  assessment: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}

function buildNameMap(list) {
  const map = new Map()
  for (const s of list || []) {
    const id = String(s.student_id || s.studentId || s.id || '')
    if (!id) continue
    const full = `${s.first_name || s.firstname || ''} ${s.last_name || s.lastname || ''}`.trim()
    if (full) map.set(id, full)
    else if (s.full_name || s.name) map.set(id, s.full_name || s.name)
  }
  return map
}

export default function AssessmentResults() {
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Needs Attention' },
    { key: 'watch', label: 'Monitor' },
    { key: 'normal', label: 'Normal' },
  ]

  const fetchLive = async () => {
    try {
      setLoading(true)
      setPageError('')
      const [res, studentsRes] = await Promise.all([
        fetch(`${BASE}/assessment_results/get_results.php?all=1`).then(r => r.json()).catch(() => []),
        fetch(`${BASE}/students/get_students.php?all=1`).then(r => r.json()).catch(() => []),
      ])
      const rawData = Array.isArray(res) ? res : res.data || res.result || []
      const studentsList = Array.isArray(studentsRes) ? studentsRes : studentsRes.data || studentsRes.result || studentsRes.students || []
      const nameMap = buildNameMap(studentsList)
      const mapped = rawData.map(row => {
        const score = Number(row.score) || 0
        const pct = Math.min(100, Math.max(0, Math.round((score / 40) * 100)))
        const label = row.result_label || row.result || row.interpretation || ''
        const flag = normalizeFlag(row.flag_level || row.flag || row.status)
        const studentId = String(row.student_id || row.studentId || '')
        const resolvedName = row.student_name || row.name || row.full_name || (studentId && nameMap.has(studentId) ? nameMap.get(studentId) : '')
        return {
          id: row.result_id || row.id,
          name: resolvedName || `Student ${studentId}`,
          studentId: studentId,
          exam: row.exam_type || row.exam || row.test_type || 'Assessment',
          result: label ? `${pct}% — ${label}` : `${pct}%`,
          score: score,
          pct: pct,
          label: label,
          flag: flag,
          date: row.date_taken || row.created_at || row.date || row.submitted_at,
          raw: row,
        }
      })
      setResults(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (e) {
      setResults([])
      setPageError('Cannot connect to server. Check if XAMPP (Apache) is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLive() }, [])

  const stats = useMemo(() => ({
    urgent: results.filter(r => r.flag === 'urgent').length,
    watch: results.filter(r => r.flag === 'watch').length,
    normal: results.filter(r => r.flag === 'normal').length,
  }), [results])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? results : results.filter(r => r.flag === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q) || String(r.studentId).includes(q))
    }
    return list
  }, [results, filter, search])

  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading assessment results...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">Assessment Results</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">{filtered.length} showing — {results.length} total — Confidential under RA 10173</p>
        </div>
        <button onClick={fetchLive} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Needs Attention', value: stats.urgent, color: '#B91C1C', bg: 'bg-red-50', border: 'border-red-200', sub: 'Review immediately', key: 'urgent' },
          { label: 'Monitor', value: stats.watch, color: '#B45309', bg: 'bg-amber-50', border: 'border-amber-200', sub: 'Requires monitoring', key: 'watch' },
          { label: 'Normal', value: stats.normal, color: '#085041', bg: 'bg-[#E8F5F1]', border: 'border-[#9FE1CB]', sub: 'No action required', key: 'normal' },
        ].map((stat) => (
          <button key={stat.key} onClick={() => setFilter(stat.key)} className="bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer">
            <div className="flex items-start justify-between">
              <div><p className="text-[24px] font-extrabold leading-none" style={{ color: stat.color }}>{stat.value}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">{stat.label}</p><p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p></div>
              <div className={`w-8 h-8 rounded-[10px] ${stat.bg} border ${stat.border} flex items-center justify-center shrink-0`} style={{ color: stat.color }}>{Icon.assessment('w-4 h-4')}</div>
            </div>
          </button>
        ))}
      </div>

      {pageError && <div className="bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium px-4 py-2.5 rounded-[14px]">{pageError} <button onClick={() => setPageError('')} className="ml-2 font-bold underline">Dismiss</button></div>}

      <div className="bg-white border border-gray-100 rounded-[20px] p-3.5 flex flex-wrap items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`text-[12px] font-semibold px-4 py-1.5 rounded-full border transition ${filter === f.key ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {f.key === 'all' ? `All (${results.length})` : f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3.5 pr-2 py-1.5 w-full sm:w-[220px]">
          {Icon.search('w-3.5 h-3.5 text-gray-400 shrink-0')}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or student no." className="bg-transparent text-[12px] w-full outline-none placeholder:text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-gray-100 bg-gray-50/70">{['Student', 'Exam', 'Result', 'Flag', 'Date'].map(h => <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F4F7F5] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.assessment('w-6 h-6')}</div>
                  <p className="text-[13px] font-semibold text-gray-700">No assessment results yet.</p>
                  <p className="text-[12px] text-gray-400 mt-1">When a student completes an assessment, the result will appear here.</p>
                </td></tr>
              )}
              {filtered.map(e => (
                <tr key={e.id} className={`hover:bg-gray-50/70 ${e.flag === 'urgent' ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3.5"><p className="text-[13px] font-semibold text-gray-900">{e.name}</p><p className="text-[11px] text-gray-500">{e.studentId}</p></td>
                  <td className="px-4 py-3.5"><span className="bg-gray-50 border border-gray-100 text-[11px] font-semibold px-2.5 py-1 rounded-full text-gray-700 whitespace-nowrap">{e.exam}</span></td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-700 max-w-[200px] truncate">{e.result}</td>
                  <td className="px-4 py-3.5"><FlagBadge flag={e.flag} /></td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{formatDate(e.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center">Confidential under RA 10173</p>
    </div>
  )
}