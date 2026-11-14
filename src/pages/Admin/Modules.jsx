import { useState, useEffect, useMemo } from 'react'

const BASE = 'http://localhost/gco-api'

const catLabel = {
  academic: 'Academic',
  social: 'Personal-Social-Emotional',
  career: 'Career'
}

const catStyle = {
  academic: 'bg-[#e6f1fb] text-[#185FA5] border-[#bdd7f5]',
  social: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
  career: 'bg-[#ede9fe] text-[#3C3489] border-[#d8d0ff]',
}

const Icon = {
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  plus: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  modules: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M12 6.5a9.5 9.5 0 109.5 9.5A9.51 9.51 0 0012 6.5zM12 16.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  search: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}

// Puting Modal — pamalit sa confirm() / alert(). Same style sa Appointments v4.
function ConfirmModal({ title, message, confirmLabel, isDanger, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl">
        <p className="text-[16px] font-bold text-gray-900">{title}</p>
        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="flex-1 border border-gray-200 rounded-full py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 text-white rounded-full py-2.5 text-[13px] font-bold ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-black'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function ModulesManagement() {
  const [modules, setModules] = useState([])
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ category: 'academic', title: '', description: '', status: 'active' })
  const [formError, setFormError] = useState('')
  const [pageError, setPageError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmArchive, setConfirmArchive] = useState(null)

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/modules/get_modules.php`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.data || data.result || []
      const normalized = list.map(m => ({
        ...m,
        category: String(m.category || m.c || 'academic').toLowerCase(),
        status: String(m.status || 'active').toLowerCase(),
        title: m.title || m.t || '',
        description: m.description || m.content || m.d || ''
      }))
      setModules(normalized)
    } catch (e) { setModules([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchModules() }, [])

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Please complete the title and description.')
      return
    }
    setFormError('')
    try {
      const endpoint = editing ? `${BASE}/modules/update_module.php` : `${BASE}/modules/create_module.php`
      const payload = editing ? { id: editing.id, ...form } : form
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (result.success === false) {
        setFormError('Failed to save module: ' + (result.message || 'Please check the server.'))
        return
      }
      setShowForm(false)
      setEditing(null)
      setForm({ category: 'academic', title: '', description: '', status: 'active' })
      fetchModules()
    } catch (err) {
      setFormError('Failed to save module. Please check create_module.php or update_module.php.')
    }
  }

  // NGAYON: hindi na confirm(), bubukas lang ng Modal
  const handleDelete = (item) => {
    setConfirmDelete(item)
  }

  const confirmDeleteModule = async () => {
    if (!confirmDelete) return
    try {
      await fetch(`${BASE}/modules/delete_module.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete.id })
      })
      setConfirmDelete(null)
      fetchModules()
    } catch {
      setConfirmDelete(null)
      setPageError('Failed to delete module.')
    }
  }

  // NGAYON: may confirm na rin, hindi na biglaang archive
  const handleArchive = (item) => {
    setConfirmArchive(item)
  }

  const confirmArchiveModule = async () => {
    if (!confirmArchive) return
    const newStatus = confirmArchive.status === 'archived' ? 'active' : 'archived'
    try {
      await fetch(`${BASE}/modules/update_module.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmArchive.id, category: confirmArchive.category, title: confirmArchive.title, description: confirmArchive.description, status: newStatus })
      })
      setConfirmArchive(null)
      fetchModules()
    } catch {
      setConfirmArchive(null)
      setPageError('Failed to update module status.')
    }
  }

  const startEdit = (item) => {
    setEditing(item)
    setFormError('')
    setForm({
      category: String(item.category || 'academic').toLowerCase(),
      title: item.title || '',
      description: item.description || '',
      status: String(item.status || 'active').toLowerCase()
    })
    setShowForm(true)
  }

  const stats = useMemo(() => ({
    total: modules.length,
    academic: modules.filter(m => m.category === 'academic').length,
    social: modules.filter(m => m.category === 'social').length,
    career: modules.filter(m => m.category === 'career').length,
    active: modules.filter(m => m.status !== 'archived').length,
  }), [modules])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? modules : modules.filter(m => m.category === filter)
    if (statusFilter !== 'all') list = list.filter(m => m.status === statusFilter)
    if (search.trim()) list = list.filter(m => m.title.toLowerCase().includes(search.trim().toLowerCase()) || m.description.toLowerCase().includes(search.trim().toLowerCase()))
    return list
  }, [modules, filter, statusFilter, search])

  const isTestData = (m) => {
    const t = (m.title + ' ' + m.description).toLowerCase()
    return t.length < 10 || ['wwwe', 'wewew', 'wews', 'try lang', 'test', 'asdf'].some(w => t.includes(w))
  }

  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading modules...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">Modules Management</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">{stats.total} modules • {stats.active} active • Visible to students</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchModules} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
          <button onClick={() => { setEditing(null); setFormError(''); setForm({ category: 'academic', title: '', description: '', status: 'active' }); setShowForm(true) }} className="bg-[#085041] text-white px-4 py-2 rounded-full text-[12px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#06382D]">{Icon.plus('w-3.5 h-3.5')} Add Module</button>
        </div>
      </div>

      {pageError && <div className="bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium px-4 py-2.5 rounded-[14px]">{pageError} <button onClick={() => setPageError('')} className="ml-2 font-bold underline">Dismiss</button></div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => setFilter('all')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'all' ? 'ring-2 ring-[#085041]/20 border-[#085041]/30' : ''}`}><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Total Modules</p><p className="text-[24px] font-extrabold text-gray-900 mt-1 leading-none">{stats.total}</p><p className="text-[11px] text-gray-400 mt-1.5">All categories</p></button>
        <button onClick={() => setFilter('academic')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'academic' ? 'ring-2 ring-[#185FA5]/20 border-[#185FA5]/30' : ''}`}><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#185FA5]" /><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Academic</p></div><p className="text-[24px] font-extrabold text-[#185FA5] mt-1 leading-none">{stats.academic}</p><p className="text-[11px] text-gray-400 mt-1.5">Study skills and related topics</p></button>
        <button onClick={() => setFilter('social')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'social' ? 'ring-2 ring-[#085041]/20 border-[#085041]/30' : ''}`}><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#085041]" /><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Social-Emotional</p></div><p className="text-[24px] font-extrabold text-[#085041] mt-1 leading-none">{stats.social}</p><p className="text-[11px] text-gray-400 mt-1.5">Well-being and stress management</p></button>
        <button onClick={() => setFilter('career')} className={`bg-white border border-gray-100 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${filter === 'career' ? 'ring-2 ring-[#3C3489]/20 border-[#3C3489]/30' : ''}`}><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3C3489]" /><p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Career</p></div><p className="text-[24px] font-extrabold text-[#3C3489] mt-1 leading-none">{stats.career}</p><p className="text-[11px] text-gray-400 mt-1.5">Future planning</p></button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[20px] p-3.5 flex flex-wrap items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'academic', 'social', 'career'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border capitalize ${filter === f ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>{f === 'all' ? `All (${modules.length})` : f === 'social' ? 'Social-Emotional' : f}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setStatusFilter('all')} className={`text-[12px] font-medium px-3 py-1.5 rounded-full border ${statusFilter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>All Status</button>
          <button onClick={() => setStatusFilter('active')} className={`text-[12px] font-medium px-3 py-1.5 rounded-full border ${statusFilter === 'active' ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-600 border-gray-200'}`}>Active</button>
          <button onClick={() => setStatusFilter('archived')} className={`text-[12px] font-medium px-3 py-1.5 rounded-full border ${statusFilter === 'archived' ? 'bg-gray-500 text-white border-gray-500' : 'bg-white text-gray-600 border-gray-200'}`}>Archived</button>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3.5 pr-2 py-1.5 w-full sm:w-[220px]">
          {Icon.search('w-3.5 h-3.5 text-gray-400 shrink-0')}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="bg-transparent text-[12px] w-full outline-none placeholder:text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-3 bg-white border border-gray-100 rounded-[20px] p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-[14px] bg-[#F4F7F5] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.modules('w-6 h-6')}</div>
            <p className="text-[14px] font-bold text-gray-900">No modules yet</p>
            <p className="text-[12px] text-gray-500 mt-1">Create a module to make it available to students.</p>
            <button onClick={() => { setEditing(null); setFormError(''); setForm({ category: 'academic', title: '', description: '', status: 'active' }); setShowForm(true) }} className="mt-4 bg-[#085041] text-white px-5 py-2 rounded-full text-[12px] font-bold flex items-center gap-1.5 mx-auto">{Icon.plus('w-3.5 h-3.5')} Add First Module</button>
          </div>
        )}
        {filtered.map(m => (
          <div key={m.id} className={`bg-white border border-gray-100 rounded-[20px] p-5 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${m.status === 'archived' ? 'opacity-60 bg-gray-50' : ''}`}>
            <div className="flex justify-between items-start mb-3 gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${catStyle[m.category] || 'bg-gray-100 border-gray-200'}`}>{catLabel[m.category] || m.category}</span>
              <div className="flex gap-1.5">
                {isTestData(m) && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Possible test data</span>}
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize ${m.status === 'archived' ? 'bg-gray-200 text-gray-600 border-gray-200' : 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]'}`}>{m.status}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-[12px] bg-[#E8F5F1] flex items-center justify-center text-[#085041] mb-3">{Icon.modules('w-5 h-5')}</div>
            <h4 className="text-[15px] font-bold text-gray-900 leading-snug">{m.title}</h4>
            <p className="text-[13px] text-gray-500 mt-1.5 flex-1 leading-relaxed line-clamp-3">{m.description}</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => startEdit(m)} className="flex-1 bg-gray-900 text-white text-[12px] font-bold px-3 py-2 rounded-full hover:bg-black">Edit</button>
              <button onClick={() => handleArchive(m)} className="flex-1 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold px-3 py-2 rounded-full hover:border-gray-300">{m.status === 'archived' ? 'Unarchive' : 'Archive'}</button>
              <button onClick={() => handleDelete(m)} className="bg-white border border-red-200 text-red-600 text-[12px] font-bold px-3 py-2 rounded-full hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[16px] font-bold text-gray-900 tracking-tight">{editing ? 'Edit Module' : 'Add New Module'}</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">{Icon.x('w-4 h-4')}</button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white outline-none focus:border-[#085041]"><option value="academic">Academic</option><option value="social">Personal-Social-Emotional</option><option value="career">Career</option></select></div>
              <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title e.g. Study Skills" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#085041]" /></div>
              <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Enter a description for this module" rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] resize-none outline-none focus:border-[#085041]" /></div>
              {formError && <p className="bg-red-50 border border-red-200 text-red-700 text-[12px] font-medium px-3 py-2 rounded-xl">{formError}</p>}
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} className="flex-1 bg-[#085041] text-white py-3 rounded-full text-[13px] font-bold hover:bg-[#06382D]">{editing ? 'Update Module' : 'Create Module'}</button>
                <button onClick={() => setShowForm(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Module?"
          message={`Delete "${confirmDelete.title}"? It will no longer be visible to students. This cannot be undone.`}
          confirmLabel="Delete"
          isDanger={true}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteModule}
        />
      )}

      {confirmArchive && (
        <ConfirmModal
          title={confirmArchive.status === 'archived' ? 'Unarchive Module?' : 'Archive Module?'}
          message={confirmArchive.status === 'archived' ? `Unarchive "${confirmArchive.title}"? It will be visible to students again.` : `Archive "${confirmArchive.title}"? It will be hidden from students.`}
          confirmLabel={confirmArchive.status === 'archived' ? 'Unarchive' : 'Archive'}
          isDanger={false}
          onCancel={() => setConfirmArchive(null)}
          onConfirm={confirmArchiveModule}
        />
      )}
    </div>
  )
}