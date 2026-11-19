import { useEffect, useMemo, useState } from 'react'

const API = 'https://cheerful-magenta-fly-38.hostingersite.com/api'
const FILE_BASE = 'https://cheerful-magenta-fly-38.hostingersite.com'

const emptyForm = {
  link: '', category: 'academic', title: '', description: '', source: '',
  file: null, fileName: '', fileType: '', fileSize: 0
}

const catStyle = {
  academic: 'bg-[#EAF2FA] text-[#185FA5] border-[#B9D6F2]',
  social: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
  career: 'bg-[#EDEAFA] text-[#3C3489] border-[#C9C2F0]',
}

const catLabel = {
  academic: 'Academic',
  social: 'Social-Emotional',
  career: 'Career'
}

const catOrder = { academic: 0, social: 1, career: 2 }

// ===== EXCLUSIVE LANG KAY COUNSELLOR MODULES - WALANG SEPARATE FILE =====
// Ito yung dating hinahanap ni Modules sa labas, ngayon nasa loob na nya.
function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', isDanger = false }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]" onClick={onCancel}>
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-2xl text-center" onClick={e => e.stopPropagation()}>
        <h3 className="text-[15px] font-bold text-gray-900">{title || 'Are you sure?'}</h3>
        {message && <p className="text-[12.5px] text-gray-500 mt-2 leading-relaxed">{message}</p>}
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="flex-1 border border-gray-200 py-2.5 rounded-full text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-full text-[13px] font-bold text-white ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#085041] hover:bg-[#06382D]'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ===== AUTO FORMAT / AUTO DETECT =====
function formatTitleFromFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

function detectCategoryFromText(text) {
  const s = String(text || '').toLowerCase()
  if (s.includes('stress') || s.includes('anxiety') || s.includes('mental') || s.includes('well') || s.includes('mind') || s.includes('counsel') || s.includes('emotion') || s.includes('self') || s.includes('bully') || s.includes('friend')) return 'social'
  if (s.includes('career') || s.includes('job') || s.includes('resume') || s.includes('interview') || s.includes('future') || s.includes('college') || s.includes('course')) return 'career'
  return 'academic'
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function getFileExt(name) {
  return String(name || '').split('.').pop()?.toUpperCase() || 'FILE'
}

export default function Modules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [pageError, setPageError] = useState('')
  const [fetchingLink, setFetchingLink] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmArchive, setConfirmArchive] = useState(null)
  const [sourceType, setSourceType] = useState('link')

  const Icon = {
    plus: (c) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>),
    search: (c) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>),
    x: (c) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>),
    link: (c) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    modules: (c) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M12 6.042A8.919 8.919 0 006 3c-1.472 0-2.882.586-3.92 1.627L2 4.5l.08.08C2.99 5.48 4.48 6.04 6 6.04M12 6.042V18M12 6.042c.54 0 1.05.02 1.54.06C14.47 6.13 15.9 6.5 17.1 7.24 18.06 7.87 19.1 8.2 20 8.2M12 18c-1.472 0-2.882.586-3.92 1.627L8 19.5l-.08.08C8.99 20.48 10.48 21.04 12 21.04M12 18V6.04" strokeLinecap="round" /></svg>),
    file: (c) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8" strokeLinecap="round" /></svg>),
  }

  const fetchModules = async () => {
    setLoading(true); setPageError('')
    try {
      const r = await fetch(`${API}/modules/get_modules.php`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = await r.json()
      const list = Array.isArray(j) ? j : (j.data || j.modules || [])
      const normalized = list.map(m => ({
        ...m,
        id: m.module_id ?? m.id,
        description: m.content ?? m.description ?? '',
        status: (m.is_active == 1 || m.is_active === true || m.status === 'active') ? 'active' : 'archived',
        link: m.link || m.source_link || '',
      }))
      setModules(normalized)
    } catch (e) {
      setPageError('Could not load modules. Check your connection or API.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchModules() }, [])

  const handleLinkChange = async (value) => {
    setForm(prev => ({ ...prev, link: value }))
    if (!value || !value.startsWith('http')) return
    setFetchingLink(true)
    try {
      const r = await fetch(`${API}/modules/fetch_link_meta.php?url=${encodeURIComponent(value)}`)
      if (r.ok) {
        const meta = await r.json()
        setForm(prev => ({
          ...prev,
          title: prev.title || meta.title || '',
          description: prev.description || meta.description || '',
          source: meta.source || prev.source || new URL(value).hostname.replace('www.', ''),
          category: prev.category || detectCategoryFromText(`${meta.title} ${meta.description} ${value}`),
        }))
      }
    } catch {} finally { setFetchingLink(false) }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const title = formatTitleFromFilename(file.name)
    const category = detectCategoryFromText(`${file.name} ${title}`)
    setForm(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileType: file.type || getFileExt(file.name),
      fileSize: file.size,
      title: prev.title || title,
      category: category,
      description: prev.description || `Uploaded material: ${title} (${getFileExt(file.name)} • ${formatFileSize(file.size)})`,
      source: prev.source || 'Uploaded File',
      link: '',
    }))
    setSourceType('file')
  }

  const startEdit = (m) => {
    setEditing(m)
    setFormError('')
    const isFile = !!m.file_path || !!m.file_url || m.source === 'Uploaded File'
    setSourceType(isFile ? 'file' : 'link')
    setForm({
      link: m.link || m.source_link || '',
      category: m.category || 'academic',
      title: m.title || '',
      description: m.content || m.description || '',
      source: m.source || '',
      file: null,
      fileName: m.file_name || (m.file_path ? m.file_path.split('/').pop() : ''),
      fileType: m.file_type || '',
      fileSize: m.file_size || 0,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) { setFormError('Title and description are required.'); return }
    if (sourceType === 'link' && !form.link.trim() && !editing) { setFormError('Please paste a source link or switch to Upload File.'); return }
    if (sourceType === 'file' && !form.file && !editing && !form.fileName) { setFormError('Please choose a file to upload.'); return }
    setSaving(true); setFormError('')
    try {
      const url = editing ? `${API}/modules/update_module.php` : `${API}/modules/create_module.php`
      let res
      if (form.file) {
        const fd = new FormData()
        fd.append('file', form.file)
        fd.append('title', form.title)
        fd.append('category', form.category)
        fd.append('content', form.description)
        fd.append('description', form.description)
        fd.append('source', form.source || 'Uploaded File')
        if (editing) fd.append('id', editing.id)
        if (editing) fd.append('module_id', editing.id)
        res = await fetch(url, { method: 'POST', body: fd })
      } else {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(editing ? { id: editing.id, module_id: editing.id } : {}),
            link: form.link, category: form.category, title: form.title,
            content: form.description, description: form.description, source: form.source
          }),
        })
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const j = await res.json()
      if (j.error) throw new Error(j.error)
      setShowForm(false); setForm(emptyForm); setSourceType('link')
      fetchModules()
    } catch (e) {
      setFormError('Could not save module. Please try again.')
    } finally { setSaving(false) }
  }

  const handleArchive = (m) => setConfirmArchive(m)
  const handleDelete = (m) => setConfirmDelete(m)

  const confirmArchiveModule = async () => {
    try {
      const next = confirmArchive.status === 'archived' ? 1 : 0
      await fetch(`${API}/modules/update_module.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmArchive.id, module_id: confirmArchive.id, is_active: next, status: next ? 'active' : 'archived' })
      })
      setConfirmArchive(null); fetchModules()
    } catch { setPageError('Could not update module.') }
  }

  const confirmDeleteModule = async () => {
    try {
      await fetch(`${API}/modules/delete_module.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete.id, module_id: confirmDelete.id })
      })
      setConfirmDelete(null); fetchModules()
    } catch { setPageError('Could not delete module.') }
  }

  const stats = useMemo(() => {
    const academic = modules.filter(m => m.category === 'academic').length
    const social = modules.filter(m => ['social', 'mental-health'].includes(m.category)).length
    const career = modules.filter(m => m.category === 'career').length
    return { total: modules.length, active: modules.filter(m => m.status !== 'archived').length, academic, social, career }
  }, [modules])

  const filtered = useMemo(() => {
    let list = [...modules]
    if (filter !== 'all') list = list.filter(m => m.category === filter || (filter === 'social' && m.category === 'mental-health'))
    if (statusFilter !== 'all') list = list.filter(m => (m.status || 'active') === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m => `${m.title} ${m.description} ${m.source} ${m.file_name || ''}`.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      const ca = catOrder[a.category] ?? 99
      const cb = catOrder[b.category] ?? 99
      if (ca !== cb) return ca - cb
      return String(a.title || '').localeCompare(String(b.title || ''))
    })
    return list
  }, [modules, filter, statusFilter, search])

  if (loading) return <div className="p-6 text-[13px] text-gray-400">Loading modules...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-tight">Modules Management</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">{stats.total} modules — {stats.active} active — Visible to students • Auto-sorted by Category → Title</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchModules} className="bg-white border border-gray-200 text-[12px] font-medium px-4 py-2 rounded-full hover:border-gray-300 shadow-sm">Refresh</button>
          <button onClick={() => { setEditing(null); setFormError(''); setForm(emptyForm); setSourceType('link'); setShowForm(true) }} className="bg-[#085041] text-white px-4 py-2 rounded-full text-[12px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#06382D]">{Icon.plus('w-3.5 h-3.5')} Add Module</button>
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
            <button onClick={() => { setEditing(null); setFormError(''); setForm(emptyForm); setSourceType('link'); setShowForm(true) }} className="mt-4 bg-[#085041] text-white px-5 py-2 rounded-full text-[12px] font-bold flex items-center gap-1.5 mx-auto">{Icon.plus('w-3.5 h-3.5')} Add First Module</button>
          </div>
        )}

        {filtered.map(m => {
          const fileUrl = m.file_path ? (m.file_path.startsWith('http') ? m.file_path : FILE_BASE + m.file_path) : (m.file_url || '')
          const isFile = !!fileUrl
          return (
            <div key={m.id} className={`bg-white border border-gray-100 rounded-[20px] p-5 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${m.status === 'archived' ? 'opacity-60 bg-gray-50' : ''}`}>
              <div className="flex justify-between items-start mb-3 gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${catStyle[m.category] || 'bg-gray-100 border-gray-200'}`}>{catLabel[m.category] || m.category}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize whitespace-nowrap ${m.status === 'archived' ? 'bg-gray-200 text-gray-600 border-gray-200' : 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]'}`}>{m.status}</span>
              </div>
              <div className="w-10 h-10 rounded-[12px] bg-[#E8F5F1] flex items-center justify-center text-[#085041] mb-3">{isFile ? Icon.file('w-5 h-5') : Icon.modules('w-5 h-5')}</div>
              <h4 className="text-[15px] font-bold text-gray-900 leading-snug">{m.title}</h4>
              <p className="text-[13px] text-gray-500 mt-1.5 flex-1 leading-relaxed line-clamp-3">{m.description}</p>
              {isFile ? (
                <a href={fileUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#085041] hover:underline w-fit">
                  {Icon.file('w-3.5 h-3.5')} {getFileExt(m.file_name || fileUrl)} File {m.file_size ? `• ${formatFileSize(m.file_size)}` : ''} — Open / Download
                </a>
              ) : m.link && (
                <a href={m.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#085041] hover:underline w-fit">
                  {Icon.link('w-3.5 h-3.5')} {m.source || 'View Resource'}
                </a>
              )}
              <div className="flex gap-2 mt-5">
                <button onClick={() => startEdit(m)} className="flex-1 bg-gray-900 text-white text-[12px] font-bold px-3 py-2 rounded-full hover:bg-black">Edit</button>
                <button onClick={() => handleArchive(m)} className="flex-1 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold px-3 py-2 rounded-full hover:border-gray-300">{m.status === 'archived' ? 'Unarchive' : 'Archive'}</button>
                <button onClick={() => handleDelete(m)} className="bg-white border border-red-200 text-red-600 text-[12px] font-bold px-3 py-2 rounded-full hover:bg-red-50">Delete</button>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[16px] font-bold text-gray-900 tracking-tight">{editing ? 'Edit Module' : 'Add New Module'}</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">{Icon.x('w-4 h-4')}</button>
            </div>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setSourceType('link')} className={`flex-1 py-2 rounded-full text-[12px] font-bold ${sourceType === 'link' ? 'bg-[#085041] text-white' : 'bg-gray-100 text-gray-600'}`}>🔗 Link</button>
              <button type="button" onClick={() => setSourceType('file')} className={`flex-1 py-2 rounded-full text-[12px] font-bold ${sourceType === 'file' ? 'bg-[#085041] text-white' : 'bg-gray-100 text-gray-600'}`}>📄 Upload File</button>
            </div>
            <div className="flex flex-col gap-3">
              {sourceType === 'link' ? (
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Source Link</label>
                  <input value={form.link} onChange={e => handleLinkChange(e.target.value)} placeholder="Paste link e.g. https://www.who.int/..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#085041]" />
                  {fetchingLink && <p className="text-[11px] text-[#085041] mt-1.5">Fetching details from link...</p>}
                  {form.source && !fetchingLink && <p className="text-[11px] text-gray-400 mt-1.5">Source: {form.source} — You can still edit title and description below.</p>}
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Upload File — PDF / DOC / PPT / Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#085041]">
                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id="module-file-input" />
                    <label htmlFor="module-file-input" className="cursor-pointer">
                      <p className="text-[13px] font-bold text-[#085041]">{form.fileName ? `✅ ${form.fileName}` : 'Click to choose file'}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{form.fileName ? `${getFileExt(form.fileName)} • ${formatFileSize(form.fileSize)} — Title & Category auto-detected` : 'PDF, DOCX, PPTX, JPG, PNG — Title & Category auto-detected from filename'}</p>
                    </label>
                  </div>
                  {form.fileName && <p className="text-[11px] text-gray-500 mt-1.5">Auto-filled: Title & Category from filename. Pwede mo pa rin i-edit sa baba.</p>}
                </div>
              )}
              <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Category — Auto-detected</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white outline-none focus:border-[#085041]"><option value="academic">Academic</option><option value="social">Personal-Social-Emotional</option><option value="career">Career</option></select></div>
              <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Title — Auto-detected</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title e.g. Managing Stress" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#085041]" /></div>
              <div><label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Description — Auto-detected</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Enter a description for this module" rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] resize-none outline-none focus:border-[#085041]" /></div>
              {formError && <p className="bg-red-50 border border-red-200 text-red-700 text-[12px] font-medium px-3 py-2 rounded-xl">{formError}</p>}
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#085041] text-white py-3 rounded-full text-[13px] font-bold hover:bg-[#06382D] disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update Module' : 'Create Module'}</button>
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