/* ============ ADMIN MODULES MANAGEMENT - HOME DESIGN SYSTEM ============ */
import { useState, useEffect } from 'react'

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
  chevron: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}

export default function ModulesManagement() {
  const [modules, setModules] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ category: 'academic', title: '', description: '', status: 'active' })

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/modules/get_modules.php`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.data || data.result || []
      // [FIX 1] Normalize category + status para mag-match counter, filter, at badge
      const normalized = list.map(m => ({
        ...m,
        category: String(m.category || m.c || 'academic').toLowerCase(),
        status: String(m.status || 'active').toLowerCase(),
        title: m.title || m.t || '',
        description: m.description || m.content || m.d || ''
      }))
      setModules(normalized)
    } catch (e) {
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchModules() }, [])

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return alert('Fill title & description boss!')
    try {
      const endpoint = editing ? `${BASE}/modules/update_module.php` : `${BASE}/modules/create_module.php`
      const payload = editing ? { id: editing.id, ...form } : form
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.success === false) {
        alert('Failed: ' + (result.message || 'Check PHP'))
        return
      }
      setShowForm(false); setEditing(null)
      setForm({ category: 'academic', title: '', description: '', status: 'active' })
      fetchModules()
    } catch (err) {
      alert('Failed - check create_module.php / update_module.php mo boss')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this module boss? Makikita sa student side na wala na to!')) return
    try {
      await fetch(`${BASE}/modules/delete_module.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      fetchModules()
    } catch { alert('Delete failed') }
  }

  const handleArchive = async (item) => {
    const newStatus = item.status === 'archived' ? 'active' : 'archived'
    try {
      // [FIX 2] Isama buong data para hindi mabura yung title pag nag-archive
      await fetch(`${BASE}/modules/update_module.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          category: item.category,
          title: item.title,
          description: item.description,
          status: newStatus
        })
      })
      fetchModules()
    } catch { alert('Archive failed') }
  }

  const startEdit = (item) => {
    setEditing(item)
    setForm({
      category: String(item.category || 'academic').toLowerCase(),
      title: item.title || '',
      description: item.description || '',
      status: String(item.status || 'active').toLowerCase()
    })
    setShowForm(true)
  }

  const filtered = filter === 'all' ? modules : modules.filter(m => m.category === filter)

  if (loading) return <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] p-10 text-center text-[13px] text-gray-400">Loading modules from gco-api...</div>

  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)] flex flex-col p-5 md:p-6">
      {/* Header - HOME STYLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Modules Management</h1>
          <p className="text-[13px] text-gray-500 mt-1">{modules.length} modules — LIVE sa Student Side</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200 hover:border-[#085041]/30 hover:shadow-[0_2px_8px_rgba(8,80,65,0.08)] focus:outline-none focus:border-[#085041] focus:shadow-[0_0_0_3px_rgba(8,80,65,0.1)]">
            <option value="all">All Categories</option><option value="academic">Academic</option><option value="social">Personal-Social-Emotional</option><option value="career">Career</option>
          </select>
          <button onClick={() => { setEditing(null); setForm({ category: 'academic', title: '', description: '', status: 'active' }); setShowForm(true) }} className="bg-[#085041] text-white px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(8,80,65,0.25)] hover:-translate-y-[1px] active:scale-[0.98]">
            {Icon.plus('w-4 h-4')} Add Module
          </button>
          <button onClick={fetchModules} className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 hover:shadow-[0_4px_12px_rgba(8,80,65,0.08)] hover:border-[#085041]/20 hover:-translate-y-[1px] active:scale-[0.98]">Refresh</button>
        </div>
      </div>

      {/* Category Summary - HOME CARD HOVER */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { key: 'academic', label: 'Academic', count: modules.filter(m => m.category === 'academic').length, dot: 'bg-[#185FA5]' },
          { key: 'social', label: 'Social-Emotional', count: modules.filter(m => m.category === 'social').length, dot: 'bg-[#085041]' },
          { key: 'career', label: 'Career', count: modules.filter(m => m.category === 'career').length, dot: 'bg-[#3C3489]' },
        ].map(stat => (
          <button key={stat.key} onClick={() => setFilter(stat.key)} className={`bg-white rounded-2xl p-4 border text-left transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[1px] active:scale-[0.99] ${filter === stat.key ? 'border-[#085041] shadow-[0_4px_16px_rgba(8,80,65,0.15)]' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${stat.dot}`} /><p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{stat.label}</p></div>
            <p className="text-[22px] font-bold text-gray-900 mt-1">{stat.count}</p>
          </button>
        ))}
      </div>

      {/* Modules Grid - HOME CARD STYLE SAME AS HOME 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl border border-gray-200 p-12 text-center transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.08)]">
            <div className="w-12 h-12 rounded-xl bg-[#f6f8f7] border border-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{Icon.modules('w-6 h-6')}</div>
            <p className="text-[14px] font-bold text-gray-900">No modules yet</p>
            <p className="text-[12px] text-gray-500 mt-1">Add ka boss, lalabas agad sa student side!</p>
            <button onClick={() => { setEditing(null); setForm({ category: 'academic', title: '', description: '', status: 'active' }); setShowForm(true) }} className="mt-4 bg-[#085041] text-white px-5 py-2 rounded-full text-[12px] font-bold transition-all duration-200 hover:shadow-[0_4px_12px_rgba(8,80,65,0.2)] hover:-translate-y-[1px] active:scale-[0.98]">+ Add First Module</button>
          </div>
        )}
        {filtered.map(m => (
          <div key={m.id} className={`group bg-white rounded-2xl border border-gray-200 p-5 flex flex-col text-left transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[2px] active:scale-[0.99] ${m.status === 'archived' ? 'opacity-60 bg-gray-50/50' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all duration-200 group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${catStyle[m.category] || 'bg-gray-100 border-gray-200'}`}>{catLabel[m.category] || m.category}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${m.status === 'archived' ? 'bg-gray-200 text-gray-600 border-gray-200' : 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]'}`}>{m.status}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] flex items-center justify-center text-[#085041] mb-4 transition-all duration-200 group-hover:bg-[#085041] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(8,80,65,0.2)]">{Icon.modules('w-5 h-5')}</div>
            <h4 className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-[#085041] transition-colors duration-200">{m.title}</h4>
            <p className="text-[13px] text-gray-500 mt-2 flex-1 leading-relaxed line-clamp-3">{m.description}</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => startEdit(m)} className="flex-1 bg-gray-900 text-white text-[12px] font-bold px-3 py-2 rounded-full transition-all duration-200 hover:bg-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-[0.5px] active:scale-[0.98]">Edit</button>
              <button onClick={() => handleArchive(m)} className="flex-1 bg-white border border-gray-200 text-gray-600 text-[12px] font-bold px-3 py-2 rounded-full transition-all duration-200 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[0.5px] active:scale-[0.98]">{m.status === 'archived' ? 'Unarchive' : 'Archive'}</button>
              <button onClick={() => handleDelete(m.id)} className="bg-white border border-red-200 text-red-600 text-[12px] font-bold px-3 py-2 rounded-full transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:shadow-[0_2px_8px_rgba(220,38,38,0.12)] hover:-translate-y-[0.5px] active:scale-[0.98]">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal - HOME STYLE */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[16px] font-bold text-gray-900">{editing ? 'Edit Module' : 'Add New Module'}</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-[#f6f8f7] border border-gray-100 flex items-center justify-center text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-[0.95]">{Icon.x('w-4 h-4')}</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white transition-all duration-200 hover:border-[#085041]/30 focus:outline-none focus:border-[#085041] focus:shadow-[0_0_0_3px_rgba(8,80,65,0.1)]">
                  <option value="academic">Academic</option><option value="social">Personal-Social-Emotional</option><option value="career">Career</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title e.g. Study Skills" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200 hover:border-[#085041]/30 focus:outline-none focus:border-[#085041] focus:shadow-[0_0_0_3px_rgba(8,80,65,0.1)]" />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description ng module" rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] resize-none transition-all duration-200 hover:border-[#085041]/30 focus:outline-none focus:border-[#085041] focus:shadow-[0_0_0_3px_rgba(8,80,65,0.1)]" />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} className="flex-1 bg-[#085041] text-white py-3 rounded-full text-[13px] font-bold flex items-center justify-center gap-1 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(8,80,65,0.25)] hover:-translate-y-[1px] active:scale-[0.98]">{editing ? 'Update' : 'Create'} <span className="opacity-70">→ LIVE sa Student!</span></button>
                <button onClick={() => setShowForm(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-bold text-gray-600 transition-all duration-200 hover:bg-[#f6f8f7] hover:border-gray-300 active:scale-[0.98]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}