import { useState, useEffect, useMemo } from 'react'

const BASE = 'http://localhost/gco-api'

function Badge({ status }) {
  const isPublished = String(status || '').toLowerCase() === 'published'
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${isPublished ? 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-[#085041]' : 'bg-gray-400'}`} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}

const Icon = {
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  plus: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  megaphone: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M3 11l18-5v12L3 13v-2z" strokeLinecap="round" strokeLinejoin="round" /><path d="M11.5 16.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}

// Puting Modal — pamalit sa confirm() / alert(). Same style sa Appointments v4 at Modules v2.
function ConfirmModal({ title, message, confirmLabel, isDanger, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl">
        <p className="text-[16px] font-bold text-gray-900">{title}</p>
        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="flex-1 border border-gray-200 rounded-full py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 text-white rounded-full py-2.5 text-[13px] font-bold ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#085041] hover:bg-[#06382D]'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', desc: '', status: 'Draft' })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [pageError, setPageError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmToggle, setConfirmToggle] = useState(null)

  const fetchLive = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/announcements/get_announcements.php`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.announcements || data.data || data.result || []
      const mapped = list.map(row => ({
        id: row.id || row.announcement_id,
        title: row.title,
        desc: row.description || row.desc || row.content,
        date: row.created_at || row.date || row.date_posted,
        status: row.status || 'Draft',
        raw: row,
      }))
      setAnnouncements(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (e) { setAnnouncements([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchLive() }, [])

  const handleSave = async (wantStatus) => {
    const statusToSave = wantStatus || form.status
    if (!form.title.trim()) {
      setFormError('Please enter a title.')
      return
    }
    if (!form.desc.trim()) {
      setFormError('Please enter a description.')
      return
    }
    setFormError('')
    try {
      const res = editing
        ? await fetch(`${BASE}/announcements/update_announcement.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editing.id, announcement_id: editing.id, title: form.title, description: form.desc, status: statusToSave })
          })
        : await fetch(`${BASE}/announcements/create_announcement.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: form.title, description: form.desc, status: statusToSave })
          })
      const result = await res.json().catch(() => ({}))
      if (result && result.success === false) {
        setFormError('Failed to save announcement: ' + (result.message || 'Please check the server.'))
        return
      }
      setForm({ title: '', desc: '', status: 'Draft' })
      setEditing(null)
      fetchLive()
    } catch (err) {
      setFormError('Failed to save announcement. Please check create_announcement.php or update_announcement.php.')
    }
  }

  // NGAYON: hindi na biglaang Publish / Unpublish — may Modal muna
  const handleToggle = (item) => {
    setConfirmToggle(item)
  }

  const confirmToggleAnnouncement = async () => {
    if (!confirmToggle) return
    const newStatus = (confirmToggle.status || '').toLowerCase() === 'published' ? 'Draft' : 'Published'
    try {
      await fetch(`${BASE}/announcements/update_announcement.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmToggle.id, announcement_id: confirmToggle.id, title: confirmToggle.title, description: confirmToggle.desc, status: newStatus })
      })
      setConfirmToggle(null)
      fetchLive()
    } catch {
      setConfirmToggle(null)
      setPageError('Failed to update announcement status.')
    }
  }

  // NGAYON: hindi na confirm(), bubukas lang ng Modal
  const handleDelete = (item) => {
    setConfirmDelete(item)
  }

  const confirmDeleteAnnouncement = async () => {
    if (!confirmDelete) return
    try {
      await fetch(`${BASE}/announcements/delete_announcement.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete.id, announcement_id: confirmDelete.id })
      })
      setConfirmDelete(null)
      fetchLive()
    } catch {
      setConfirmDelete(null)
      setPageError('Failed to delete announcement.')
    }
  }

  const handleEdit = (item) => {
    setEditing(item)
    setFormError('')
    setForm({ title: item.title, desc: item.desc, status: item.status })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isTestData = (a) => {
    const t = `${a.title || ''} ${a.desc || ''}`.toLowerCase()
    return t.length < 10 || ['wwwe', 'wewew', 'wews', 'try lang', 'test', 'asdf'].some(w => t.includes(w))
  }

  const stats = useMemo(() => ({
    total: announcements.length,
    published: announcements.filter(a => (a.status || '').toLowerCase() === 'published').length,
    draft: announcements.filter(a => (a.status || '').toLowerCase() !== 'published').length,
  }), [announcements])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? announcements : filter === 'published' ? announcements.filter(a => (a.status || '').toLowerCase() === 'published') : announcements.filter(a => (a.status || '').toLowerCase() !== 'published')
    if (search.trim()) list = list.filter(a => a.title.toLowerCase().includes(search.trim().toLowerCase()) || (a.desc || '').toLowerCase().includes(search.trim().toLowerCase()))
    return list
  }, [announcements, filter, search])

  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading announcements...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">Announcements</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">{stats.total} total • <span className="text-[#085041] font-bold">{stats.published} Published</span> = visible on Home • {stats.draft} Draft = hidden</p>
        </div>
        <button onClick={fetchLive} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
      </div>

      {pageError && <div className="bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium px-4 py-2.5 rounded-[14px]">{pageError} <button onClick={() => setPageError('')} className="ml-2 font-bold underline">Dismiss</button></div>}

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setFilter('all')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'all' ? 'ring-2 ring-[#085041]/20 border-[#085041]/30' : ''}`}><p className="text-[24px] font-extrabold text-gray-900 leading-none">{stats.total}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">Total</p></button>
        <button onClick={() => setFilter('published')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'published' ? 'ring-2 ring-[#085041]/20 border-[#085041]/30' : ''}`}><p className="text-[24px] font-extrabold text-[#085041] leading-none">{stats.published}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">Published</p></button>
        <button onClick={() => setFilter('draft')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'draft' ? 'ring-2 ring-gray-400/30 border-gray-400/40' : ''}`}><p className="text-[24px] font-extrabold text-gray-500 leading-none">{stats.draft}</p><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1.5">Draft</p></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="space-y-3 order-2 lg:order-1">
          <div className="bg-white border border-gray-100 rounded-[20px] p-3 flex items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex gap-1.5">
              <button onClick={() => setFilter('all')} className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border ${filter === 'all' ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>All</button>
              <button onClick={() => setFilter('published')} className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border ${filter === 'published' ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>Published</button>
              <button onClick={() => setFilter('draft')} className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border ${filter === 'draft' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>Draft</button>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3.5 pr-2 py-1.5 w-[180px] sm:w-[200px]">
              {Icon.search('w-3.5 h-3.5 text-gray-400 shrink-0')}
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-[12px] w-full outline-none placeholder:text-gray-400" />
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-[20px] p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="w-12 h-12 rounded-[14px] bg-[#F4F7F5] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.megaphone('w-6 h-6')}</div>
              <p className="text-[14px] font-bold text-gray-900">No announcements yet</p>
              <p className="text-[12px] text-gray-500 mt-1">When you create an announcement and publish it, it will appear on the student Home page.</p>
            </div>
          )}

          {filtered.map(a => {
            const isPub = (a.status || '').toLowerCase() === 'published'
            return (
              <div key={a.id} className="bg-white border border-gray-100 rounded-[20px] p-5 flex gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="w-10 h-10 rounded-[12px] bg-[#E8F5F1] flex items-center justify-center text-[#085041] shrink-0">{Icon.megaphone('w-5 h-5')}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap"><p className="text-[14px] font-bold text-gray-900 truncate">{a.title}</p><Badge status={a.status} />{isTestData(a) && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Possible test data</span>}</div>
                  <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2">{a.desc}</p>
                  <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-2 flex-wrap">
                    <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">{a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                    <span>ID: {a.id}</span>
                    <span>{isPub ? 'Visible to students on Home' : 'Hidden — Admin only'}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => handleToggle(a)} className={`text-[12px] font-bold px-4 py-1.5 rounded-full ${isPub ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200' : 'bg-[#085041] text-white hover:bg-[#06382D]'}`}>{isPub ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => handleEdit(a)} className="text-[12px] font-bold text-[#085041] bg-[#E1F5EE] border border-[#9FE1CB] px-4 py-1.5 rounded-full hover:bg-[#085041] hover:text-white">Edit Text</button>
                  <button onClick={() => handleDelete(a)} className="text-[11px] font-bold text-red-600 bg-white border border-red-200 px-4 py-1.5 rounded-full hover:bg-red-50">Delete</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white border border-gray-100 rounded-[20px] p-5 order-1 lg:order-2 lg:sticky lg:top-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${editing ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#E8F5F1] text-[#085041] border border-[#9FE1CB]'}`}>{Icon.megaphone('w-5 h-5')}</div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-gray-900">{editing ? 'Edit Announcement' : 'Create Announcement'}</p>
              <p className="text-[11px] text-gray-500">{editing ? `Editing ID: ${editing.id} • Status: ${editing.status}` : 'Draft = hidden • Published = visible on Home'}</p>
            </div>
            {editing && <button onClick={() => { setEditing(null); setFormError(''); setForm({ title: '', desc: '', status: 'Draft' }) }} className="ml-auto w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">{Icon.x('w-4 h-4')}</button>}
          </div>
          <div className="flex flex-col gap-3">
            <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title e.g. No Walk-in Sessions This Week" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#085041]" /></div>
            <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Description</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Enter the announcement description" rows={4} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#085041] resize-none" /></div>
            {formError && <p className="bg-red-50 border border-red-200 text-red-700 text-[12px] font-medium px-3 py-2 rounded-xl">{formError}</p>}
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => handleSave(editing.status)} className="flex-1 bg-[#085041] text-white py-2.5 rounded-full text-[13px] font-bold hover:bg-[#06382D]">Save Changes</button>
                <button onClick={() => { setEditing(null); setFormError(''); setForm({ title: '', desc: '', status: 'Draft' }) }} className="px-4 border border-gray-200 rounded-full text-[13px] font-bold text-gray-600">Cancel</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => handleSave('Published')} className="w-full bg-[#085041] text-white py-2.5 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#06382D]">{Icon.plus('w-4 h-4')} Publish Now</button>
                <button onClick={() => handleSave('Draft')} className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-full text-[13px] font-bold hover:border-gray-400">Save as Draft</button>
                <p className="text-[11px] text-gray-400 text-center">Draft = hidden from students • Publish = visible on Home</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmToggle && (
        <ConfirmModal
          title={(confirmToggle.status || '').toLowerCase() === 'published' ? 'Unpublish Announcement?' : 'Publish Announcement?'}
          message={(confirmToggle.status || '').toLowerCase() === 'published' ? `Unpublish "${confirmToggle.title}"? It will be hidden from students.` : `Publish "${confirmToggle.title}"? It will be visible to students on Home.`}
          confirmLabel={(confirmToggle.status || '').toLowerCase() === 'published' ? 'Unpublish' : 'Publish'}
          isDanger={false}
          onCancel={() => setConfirmToggle(null)}
          onConfirm={confirmToggleAnnouncement}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Announcement?"
          message={`Delete "${confirmDelete.title}"? It will no longer be visible to students. This cannot be undone.`}
          confirmLabel="Delete"
          isDanger={true}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteAnnouncement}
        />
      )}
    </div>
  )
}