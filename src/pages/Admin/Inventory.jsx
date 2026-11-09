/* ============ INVENTORY SUBMISSIONS - FIXED LIVE DATA ============ */
import { useState, useEffect } from 'react'
const BASE = 'http://localhost/gco-api'

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
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  file: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="mb-3 bg-white border border-gray-100 rounded-xl p-3">
      <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">{label}</p>
      <p className="text-gray-900 text-[13px] mt-1 whitespace-pre-wrap">{Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</p>
    </div>
  )
}

export default function InventorySubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const filters = ['all', 'Pending Review', 'Reviewed']

  const fetchLive = async () => {
    try {
      setLoading(true)
      const [needsRes, profileRes] = await Promise.all([
        fetch(`${BASE}/needs_assessment/get_needs_assessment.php`).then(r => r.json()).catch(() => ({ submissions: [] })),
        fetch(`${BASE}/student_profile/get_student_profile.php`).then(r => r.json()).catch(() => ({ submissions: [] })),
      ])

      // FIX: API mo returns {success:true, submissions:[...]}
      const needsList = needsRes.submissions || needsRes.data || needsRes.result || (Array.isArray(needsRes) ? needsRes : [])
      const profileList = profileRes.submissions || profileRes.data || profileRes.result || (Array.isArray(profileRes) ? profileRes : [])

      console.log('NEEDS RAW:', needsRes, 'COUNT:', needsList.length)
      console.log('PROFILE RAW:', profileRes, 'COUNT:', profileList.length)

      const mappedNeeds = needsList.map(row => ({
        id: `needs-${row.submission_id}`,
        rawId: row.submission_id,
        source: 'needs_assessment',
        name: row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.student_id,
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
        name: row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.student_id,
        studentId: row.student_id,
        type: 'Student Profile',
        date: row.date_submitted || row.created_at,
        status: row.status || 'Pending Review',
        details: row,
      }))

      const all = [...mappedNeeds, ...mappedProfile].sort((a,b) => new Date(b.date) - new Date(a.date))
      setSubmissions(all)
    } catch (e) {
      console.error('FETCH INVENTORY FAILED', e)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLive() }, [])

  const markReviewed = async () => {
    if (!selected) return
    try {
      const endpoint = selected.source === 'needs_assessment' 
        ? `${BASE}/needs_assessment/mark_reviewed.php` 
        : `${BASE}/student_profile/mark_reviewed.php`
      
      // FIX: API mo expects {submission_id} hindi {id}
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: selected.rawId })
      })
      
      setSubmissions(prev => prev.map(s => s.id === selected.id ? { ...s, status: 'Reviewed' } : s))
      setSelected(prev => prev ? { ...prev, status: 'Reviewed' } : prev)
    } catch (err) {
      alert('Failed to update - check mark_reviewed.php')
    }
  }

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.status === filter)

  if (loading) return <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] p-10 text-center text-[13px] text-gray-400">Loading inventory from gco-api...</div>

  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] flex flex-col p-5 md:p-6">
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Inventory Submissions</h1>
        <p className="text-[13px] text-gray-500 mt-1">Student Profile + Needs Assessment — LIVE from MySQL ({submissions.length} total)</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-[13px] font-semibold px-5 py-2.5 rounded-full whitespace-nowrap border transition-all ${filter === f ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>
            {f === 'all' ? `All (${submissions.length})` : f}
          </button>
        ))}
        <button onClick={fetchLive} className="ml-auto bg-white border border-gray-200 text-gray-600 text-[13px] font-semibold px-5 py-2.5 rounded-full">Refresh</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f6f8f7]">
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Student</th>
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Form Type</th>
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Date Submitted</th>
                <th className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Status</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#f6f8f7] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.file('w-6 h-6')}</div>
                  <p className="text-[13px] text-gray-500">No inventory submissions yet.</p>
                </td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className="group hover:bg-[#f6f8f7]">
                  <td className="px-5 py-4"><p className="text-[13px] font-bold text-gray-900 group-hover:text-[#085041]">{s.name}</p><p className="text-[11px] text-gray-500">{s.studentId}</p></td>
                  <td className="px-5 py-4"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.type==='Needs Assessment' ? 'bg-[#e6f1fb] text-[#185FA5] border-[#bdd7f5]' : 'bg-[#ede9fe] text-[#3C3489] border-[#d8d0ff]'}`}>{s.type}</span></td>
                  <td className="px-5 py-4 text-[12px] text-gray-600">{s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-5 py-4"><Badge status={s.status}/></td>
                  <td className="px-5 py-4 text-right"><button onClick={() => setSelected(s)} className="bg-white border border-gray-200 text-[#085041] text-[12px] font-bold px-4 py-1.5 rounded-full ml-auto group-hover:bg-[#085041] group-hover:text-white">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 overflow-y-auto py-8" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-[#f6f8f7] rounded-2xl p-6 w-full max-w-lg shadow-2xl my-auto max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#085041]">{Icon.file('w-5 h-5')}</div>
                <div><p className="text-[15px] font-bold text-gray-900">{selected.type}</p><p className="text-[11px] text-gray-500">{selected.name} • {selected.studentId}</p></div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">{Icon.x('w-4 h-4')}</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 mt-4 mb-4 flex items-center justify-between">
              <div><p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Submitted</p><p className="text-[12px] font-semibold text-gray-700 mt-0.5">{selected.date ? new Date(selected.date).toLocaleString() : 'N/A'}</p></div>
              <Badge status={selected.status}/>
            </div>
            <div className="space-y-1">
              {selected.details && Object.entries(selected.details).map(([key, val]) => {
                if(['profile_id','submission_id','id','status','created_at','date_submitted'].includes(key)) return null
                return <DetailRow key={key} label={key.replace(/_/g,' ')} value={val} />
              })}
            </div>
            {selected.status !== 'Reviewed' && (
              <button onClick={markReviewed} className="bg-[#085041] text-white text-[13px] font-bold py-3 rounded-full w-full mt-5">Mark as Reviewed</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}