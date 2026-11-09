/* ============ ANNOUNCEMENTS MANAGEMENT - HOME DESIGN SYSTEM ============ */
import { useState, useEffect } from 'react'
const BASE = 'http://localhost/gco-api'

function Badge({ status }) {
  const isPublished = status==='Published' || status==='published'
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${isPublished ? 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{isPublished ? '● Published' : '○ Draft'}</span>
}

const Icon = {
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  megaphone: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M3 11l18-5v12L3 13v-2z" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.5 16.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
}

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', desc: '', status: 'Draft' })
  const [loading, setLoading] = useState(true)

  const fetchLive = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/announcements/get_announcements.php`)
      const data = await res.json()
      // [FIX] Tanggapin lahat: array, {announcements:[]}, {data:[]}
      const list = Array.isArray(data) ? data : data.announcements || data.data || data.result || []
      const mapped = list.map(row => ({
        id: row.id || row.announcement_id,
        title: row.title,
        desc: row.description || row.desc || row.content,
        date: row.created_at || row.date || row.date_posted,
        status: row.status || 'Draft',
        raw: row,
      }))
      setAnnouncements(mapped.sort((a,b) => new Date(b.date) - new Date(a.date)))
    } catch (e) { setAnnouncements([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchLive() }, [])

  // CLEAN LOGIC: yung button mismo yung status. Walang dropdown.
  // Draft = nakatago sa student, Published = makikita sa Home
  const handleSave = async (wantStatus) => {
    const statusToSave = wantStatus || form.status
    if (!form.title.trim()) return alert('Lagyan mo ng title boss!')
    if (!form.desc.trim()) return alert('Lagyan mo ng description boss!')
    try {
      if (editing) {
        // Pag nag-e-edit: Save lang yung text, hindi nagbabago status maliban kung pinindot mo yung Publish/Unpublish sa listahan
        await fetch(`${BASE}/announcements/update_announcement.php`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, announcement_id: editing.id, title: form.title, description: form.desc, status: statusToSave })
        })
      } else {
        await fetch(`${BASE}/announcements/create_announcement.php`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: form.title, description: form.desc, status: statusToSave })
        })
      }
      setForm({ title: '', desc: '', status: 'Draft' }); setEditing(null); fetchLive()
    } catch (err) { alert('Failed - check create_announcement.php / update_announcement.php mo boss') }
  }

  // 1 CLICK TOGGLE - hindi mo na kailangan mag-Edit para lang mag-Publish
  const handleToggle = async (item) => {
    const newStatus = (item.status || '').toLowerCase() === 'published' ? 'Draft' : 'Published'
    try {
      await fetch(`${BASE}/announcements/update_announcement.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, announcement_id: item.id, title: item.title, description: item.desc, status: newStatus })
      })
      fetchLive()
    } catch { alert('Toggle failed') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this announcement boss? Mawawala din sa student side!')) return
    try {
      await fetch(`${BASE}/announcements/delete_announcement.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, announcement_id: id })
      }); fetchLive()
    } catch { alert('Delete failed') }
  }

  const handleEdit = (item) => {
    setEditing(item)
    setForm({ title: item.title, desc: item.desc, status: item.status })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] p-10 text-center text-[13px] text-gray-400">Loading announcements from gco-api...</div>

  const publishedCount = announcements.filter(a => (a.status || '').toLowerCase() === 'published').length

  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] flex flex-col p-5 md:p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Announcements</h1>
        <p className="text-[13px] text-gray-500 mt-1">{announcements.length} total • <span className="text-[#085041] font-bold">{publishedCount} Published</span> = makikita ng student sa Home • <span className="text-gray-400">{announcements.length - publishedCount} Draft</span> = nakatago</p>
      </div>

      {/* Create Form - HOME CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${editing ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#E8F5F1] text-[#085041] border border-[#9FE1CB]'}`}>{Icon.megaphone('w-5 h-5')}</div>
          <div>
            <p className="text-[15px] font-bold text-gray-900">{editing ? 'Edit Announcement' : 'Create Announcement'}</p>
            <p className="text-[11px] text-gray-500">{editing ? `Editing ID: ${editing.id} • Status ngayon: ${editing.status} — yung text lang mababago dito` : 'Pili ka lang: Save as Draft o Publish Now'}</p>
          </div>
          {editing && <button onClick={()=>{setEditing(null); setForm({title:'',desc:'',status:'Draft'})}} className="ml-auto w-8 h-8 rounded-full bg-[#f6f8f7] border border-gray-100 flex items-center justify-center text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-[0.95]">{Icon.x('w-4 h-4')}</button>}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Title</label>
            <input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Title e.g. No Walk-in Sessions This Week" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all duration-200 hover:border-[#085041]/30 focus:border-[#085041] focus:shadow-[0_0_0_3px_rgba(8,80,65,0.1)]" />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Description</label>
            <textarea value={form.desc} onChange={e=>setForm({...form, desc: e.target.value})} placeholder="Description ng announcement" rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#085041] focus:shadow-[0_0_0_3px_rgba(8,80,65,0.1)] hover:border-[#085041]/30 transition-all duration-200 resize-none" />
          </div>

          {/* CLEAN BUTTONS - WALANG DROPDOWN NA */}
          {editing ? (
            <div className="flex gap-2 items-center flex-wrap">
              <button onClick={() => handleSave(editing.status)} className="bg-[#085041] text-white px-6 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(8,80,65,0.25)] hover:-translate-y-[1px] active:scale-[0.98]">💾 Save Changes</button>
              <button onClick={()=>{setEditing(null); setForm({title:'',desc:'',status:'Draft'})}} className="bg-[#f6f8f7] border border-gray-200 px-5 py-2.5 rounded-full text-[13px] font-bold text-gray-600 transition-all duration-200 hover:bg-white hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.98]">Cancel</button>
              <span className="text-[11px] text-gray-400 ml-1">Gusto mo baguhin status? Gamitin mo yung Publish / Unpublish button sa listahan sa baba.</span>
            </div>
          ) : (
            <div className="flex gap-2 items-center flex-wrap">
              <button onClick={() => handleSave('Draft')} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-200 hover:border-gray-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] active:scale-[0.98]">💾 Save as Draft</button>
              <button onClick={() => handleSave('Published')} className="bg-[#085041] text-white px-6 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(8,80,65,0.25)] hover:-translate-y-[1px] active:scale-[0.98]">{Icon.plus('w-4 h-4')} Publish Now</button>
              <span className="text-[11px] text-gray-400 ml-1">Draft = nakatago sa students • Publish Now = makikita agad sa Home</span>
              <button onClick={fetchLive} className="ml-auto bg-white border border-gray-200 px-4 py-2.5 rounded-full text-[12px] font-semibold text-gray-600 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(8,80,65,0.08)] hover:border-[#085041]/20 hover:-translate-y-[1px] active:scale-[0.98]">Refresh</button>
            </div>
          )}
        </div>
      </div>

      {/* List - HOME CARD HOVER SAME AS HOME */}
      <div className="grid gap-3">
        {announcements.length===0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.08)] hover:border-[#085041]/10">
            <div className="w-12 h-12 rounded-xl bg-[#f6f8f7] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.megaphone('w-6 h-6')}</div>
            <p className="text-[14px] font-bold text-gray-900">No announcements yet</p>
            <p className="text-[12px] text-gray-500 mt-1">Walang dummy boss - pag nag create ka dito, lalabas sa student Home pag Published!</p>
            <p className="text-[11px] text-gray-400 mt-2">Live from: <code className="bg-[#f6f8f7] border border-gray-100 px-1.5 py-0.5 rounded">gco-api/announcements/get_announcements.php</code></p>
          </div>
        )}
        {announcements.map(a => {
          const isPub = (a.status || '').toLowerCase() === 'published'
          return (
          <div key={a.id} className="group bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[1px]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] flex items-center justify-center text-[#085041] flex-shrink-0 transition-all duration-200 group-hover:bg-[#085041] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(8,80,65,0.2)]">{Icon.megaphone('w-5 h-5')}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap"><p className="text-[14px] font-bold text-gray-900 group-hover:text-[#085041] transition-colors duration-200 truncate">{a.title}</p><Badge status={a.status}/></div>
              <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2">{a.desc}</p>
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-2">
                <span className="bg-[#f6f8f7] border border-gray-100 px-2 py-0.5 rounded-full">{a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                <span>ID: {a.id}</span>
                <span>{isPub ? '✅ Makikita ng students sa Home' : '👁️‍🗨️ Nakatago — Admin lang nakakakita'}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 h-fit flex-shrink-0">
              {/* 1-CLICK TOGGLE - ETO YUNG PINAKA-IMPORTANTE */}
              <button onClick={()=>handleToggle(a)} className={`text-[12px] font-bold px-4 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-[0.5px] active:scale-[0.98] ${isPub ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200' : 'bg-[#085041] text-white hover:shadow-[0_4px_12px_rgba(8,80,65,0.2)]'}`}>
                {isPub ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={()=>handleEdit(a)} className="text-[12px] font-bold text-[#085041] bg-[#E1F5EE] border border-[#9FE1CB] px-4 py-1.5 rounded-full transition-all duration-200 hover:bg-[#085041] hover:text-white hover:border-[#085041] hover:shadow-[0_4px_12px_rgba(8,80,65,0.15)] hover:-translate-y-[0.5px] active:scale-[0.98]">Edit Text</button>
              <button onClick={()=>handleDelete(a.id)} className="text-[11px] font-bold text-red-600 bg-white border border-red-200 px-4 py-1.5 rounded-full transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:shadow-[0_2px_8px_rgba(220,38,38,0.12)] hover:-translate-y-[0.5px] active:scale-[0.98]">Delete</button>
            </div>
          </div>
          )
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-6 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(8,80,65,0.08)] hover:border-[#085041]/10">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Paano ba gumagana?</p>
        <p className="text-[11px] text-gray-600 leading-relaxed">💾 <b>Draft</b> = naka-save lang, hindi makikita ng student. 🚀 <b>Published</b> = live na, makikita sa student Home. Gusto mo baguhin? Pindot mo lang <b>Publish / Unpublish</b> sa kanan ng bawat card — hindi mo na kailangan mag-Edit.</p>
      </div>
    </div>
  )
}