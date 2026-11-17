import { useState, useEffect, useMemo } from 'react'

// LOCAL: D:\xampp\htdocs\gco-api
const BASE = 'http://localhost/gco-api'
// LIVE: InfinityFree - ibalik mo to pag magde-deploy ka
// const BASE = 'https://gco-api.infinityfreeapp.com'

function Badge({ status }) {
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Reviewed: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
    reviewed: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
  }
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{status}</span>
}

const Icon = {
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  file: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3">
      <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">{label}</p>
      <p className="text-gray-900 text-[13px] mt-1 whitespace-pre-wrap">{Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</p>
    </div>
  )
}

function buildNameMap(list) {
  const map = new Map()
  for (const s of list || []) {
    const id = String(s.student_id || s.id || '')
    if (!id) continue
    const full = `${s.first_name || s.firstname || ''} ${s.last_name || s.lastname || ''}`.trim()
    if (full) map.set(id, full)
    else if (s.full_name || s.name) map.set(id, s.full_name || s.name)
  }
  return map
}

export default function InventorySubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const filters = ['all', 'Pending Review', 'Reviewed']

  const fetchLive = async () => {
    try {
      setLoading(true)
      const [needsRes, profileRes, studentsRes] = await Promise.all([
        fetch(`${BASE}/needs_assessment/get_needs_assessment.php`).then(r => r.json()).catch(() => ({ submissions: [] })),
        fetch(`${BASE}/student_profile/get_student_profile.php`).then(r => r.json()).catch(() => ({ submissions: [] })),
        fetch(`${BASE}/students/get_students.php?all=1`).then(r => r.json()).catch(() => []),
      ])
      const studentsList = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || [])
      const nameMap = buildNameMap(studentsList)
      const resolveName = (row) => {
        if (row.name) return row.name
        const full = `${row.first_name || ''} ${row.last_name || ''}`.trim()
        if (full) return full
        const sid = String(row.student_id || '')
        if (sid && nameMap.has(sid)) return nameMap.get(sid)
        return sid ? `Student ${sid}` : 'Student'
      }
      const needsList = needsRes.submissions || needsRes.data || needsRes.result || (Array.isArray(needsRes) ? needsRes : [])
      const profileList = profileRes.submissions || profileRes.data || profileRes.result || (Array.isArray(profileRes) ? profileRes : [])
      const mappedNeeds = needsList.map(row => ({
        id: `needs-${row.submission_id}`,
        rawId: row.submission_id,
        source: 'needs_assessment',
        name: resolveName(row),
        studentId: row.student_id,
        type: 'Needs Assessment',
        date: row.date_submitted,
        status: row.status || 'Pending Review',
        details: row,
      }))
      const mappedProfile = profileList.map(row => ({
        id: `profile-${row.profile_id || row.submission_id || row.id}`,
        rawId: row.profile_id || row.submission_id || row.id,
        source: 'student_profile',
        name: resolveName(row),
        studentId: row.student_id,
        type: 'Student Profile',
        date: row.date_submitted || row.created_at,
        status: row.status || 'Pending Review',
        details: row,
      }))
      const all = [...mappedNeeds, ...mappedProfile].sort((a, b) => new Date(b.date) - new Date(a.date))
      setSubmissions(all)
    } catch (e) { console.error('FETCH INVENTORY FAILED', e); setSubmissions([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchLive() }, [])

  const markReviewed = async () => {
    if (!selected) return
    try {
      const endpoint = selected.source === 'needs_assessment' ? `${BASE}/needs_assessment/mark_reviewed.php` : `${BASE}/student_profile/mark_reviewed.php`
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submission_id: selected.rawId }) })
      setSubmissions(prev => prev.map(s => s.id === selected.id ? { ...s, status: 'Reviewed' } : s))
      setSelected(prev => prev ? { ...prev, status: 'Reviewed' } : prev)
    } catch (err) { alert('Failed to update - check mark_reviewed.php') }
  }

  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status !== 'Reviewed').length,
    reviewed: submissions.filter(s => s.status === 'Reviewed').length,
    needs: submissions.filter(s => s.type === 'Needs Assessment').length,
    profile: submissions.filter(s => s.type === 'Student Profile').length,
  }), [submissions])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? submissions : submissions.filter(s => s.status === filter)
    if (search.trim()) list = list.filter(s => (s.name || '').toLowerCase().includes(search.trim().toLowerCase()) || String(s.studentId || '').includes(search.trim()))
    return list
  }, [submissions, filter, search])

  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading inventory...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">Inventory Submissions</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">Forms submitted by students. Review each form before counseling.</p>
        </div>
        <button onClick={fetchLive} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Total Submissions</p>
          <p className="text-[24px] font-extrabold text-gray-900 mt-1 leading-none">{stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-1.5">{stats.profile} Profile • {stats.needs} Needs</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Pending Review</p>
          <p className="text-[24px] font-extrabold text-amber-600 mt-1 leading-none">{stats.pending}</p>
          <p className="text-[11px] text-gray-400 mt-1.5">Awaiting review</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Reviewed</p>
          <p className="text-[24px] font-extrabold text-[#085041] mt-1 leading-none">{stats.reviewed}</p>
          <p className="text-[11px] text-gray-400 mt-1.5">Review completed</p>
        </div>
        <div className="bg-[#085041] border border-[#085041] rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none">
          <p className="text-[10px] font-bold tracking-wider text-white/60 uppercase">About This Section</p>
          <p className="text-[12.5px] font-semibold text-white mt-1.5 leading-snug">Student Profile + Needs Assessment inbox</p>
          <p className="text-[11px] text-white/60 mt-1">Initial forms submitted by students.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[20px] p-3.5 flex flex-wrap items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-1.5">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-[12px] font-semibold px-4 py-1.5 rounded-full border transition ${filter === f ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {f === 'all' ? `All (${submissions.length})` : f}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3.5 pr-2 py-1.5 w-full sm:w-[240px]">
          {Icon.search('w-3.5 h-3.5 text-gray-400 shrink-0')}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or student no." className="bg-transparent text-[12px] w-full outline-none placeholder:text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-gray-100 bg-gray-50/70">{['Student', 'Form Type', 'Date Submitted', 'Status', ''].map(h => <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F4F7F5] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.file('w-6 h-6')}</div>
                  <p className="text-[13px] font-semibold text-gray-700">No {filter === 'all' ? '' : filter.toLowerCase()} submissions yet.</p>
                  <p className="text-[12px] text-gray-400 mt-1 max-w-[360px] mx-auto leading-relaxed">When a student completes a <b>Student Profile</b> or <b>Needs Assessment</b>, it will appear here for review.</p>
                </td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3.5"><p className="text-[13px] font-semibold text-gray-900">{s.name}</p><p className="text-[11px] text-gray-500">{s.studentId}</p></td>
                  <td className="px-4 py-3.5"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.type === 'Needs Assessment' ? 'bg-[#e6f1fb] text-[#185FA5] border-[#bdd7f5]' : 'bg-[#ede9fe] text-[#3C3489] border-[#d8d0ff]'}`}>{s.type}</span></td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-600">{s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3.5"><Badge status={s.status} /></td>
                  <td className="px-4 py-3.5 text-right"><button onClick={() => setSelected(s)} className="bg-white border border-gray-200 text-[#085041] text-[12px] font-semibold px-4 py-1.5 rounded-full hover:bg-[#085041] hover:text-white transition-colors">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-[#F4F7F5] rounded-[20px] p-5 w-full max-w-lg shadow-2xl my-auto max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-white border border-gray-200 flex items-center justify-center text-[#085041]">{Icon.file('w-5 h-5')}</div>
                <div><p className="text-[15px] font-bold text-gray-900">{selected.type}</p><p className="text-[11px] text-gray-500">{selected.name} • {selected.studentId}</p></div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">{Icon.x('w-4 h-4')}</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 mt-4 mb-4 flex items-center justify-between">
              <div><p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Submitted</p><p className="text-[12px] font-semibold text-gray-700 mt-0.5">{selected.date ? new Date(selected.date).toLocaleString() : 'N/A'}</p></div>
              <Badge status={selected.status} />
            </div>
            <div className="space-y-1.5">
              {selected.details && Object.entries(selected.details).map(([key, val]) => {
                if (['profile_id', 'submission_id', 'id', 'status', 'created_at', 'date_submitted'].includes(key)) return null
                return <DetailRow key={key} label={key.replace(/_/g, ' ')} value={val} />
              })}
            </div>
            {selected.status !== 'Reviewed' && (<button onClick={markReviewed} className="bg-[#085041] text-white text-[13px] font-bold py-3 rounded-full w-full mt-5 hover:bg-[#06382D]">Mark as Reviewed</button>)}
          </div>
        </div>
      )}
    </div>
  )
}