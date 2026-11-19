import { useState, useEffect } from 'react'

const BASE = 'https://cheerful-magenta-fly-38.hostingersite.com/api'
const STORAGE_KEY = 'gco_read_modules'

const catLabel = {
  academic: 'Academic',
  social: 'Personal-Social-Emotional',
  career: 'Career',
}

const catStyle = {
  academic: 'bg-[#e6f1fb] text-[#185FA5]',
  social: 'bg-[#E1F5EE] text-[#085041]',
  career: 'bg-[#ede9fe] text-[#3C3489]',
}

const filters = ['all', 'academic', 'social', 'career']
const filterLabels = { all: 'All', academic: 'Academic', social: 'Personal-Social-Emotional', career: 'Career' }

function normCat(raw) {
  const c = String(raw || 'academic').toLowerCase().trim()
  if (c.includes('social') || c.includes('personal')) return 'social'
  if (c.includes('career')) return 'career'
  return 'academic'
}

function loadRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

// [NEW] Hatiin yung content sa paragraphs para maganda basahin dito mismo
function renderContent(text) {
  if (!text || text.startsWith('See resource:')) return null
  const paras = String(text).split(/\n\s*\n/).filter(p => p.trim().length > 10)
  if (!paras.length) return <p className="text-[14px] text-gray-700 leading-relaxed">{text}</p>
  return paras.map((p, i) => (
    <p key={i} className="text-[14.5px] text-gray-700 leading-[1.75] mt-3 first:mt-2">{p.trim()}</p>
  ))
}

export default function Modules({ showToast }) {
  const [mods, setMods] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [openMod, setOpenMod] = useState(null)
  const [read, setRead] = useState(loadRead)
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...read])) } catch {}
  }, [read])

  useEffect(() => {
    const fetchMods = async () => {
      try {
        const res = await fetch(`${BASE}/modules/get_modules.php`)
        const data = await res.json()
        let list = Array.isArray(data) ? data : data.data || []
        list = list.filter(m => {
          if (m.is_active !== undefined) return Number(m.is_active) === 1
          const st = String(m.status || '').toLowerCase()
          return st === '' || st === 'active'
        })
        setMods(list.map((m, i) => ({
          id: m.id ?? m.module_id ?? i,
          c: normCat(m.category),
          t: m.title || '',
          d: m.description || m.content || '',
          gi: i + 1,
          link: m.link || '',
          source: m.source || '',
        })))
      } catch (e) { setMods([]) }
      finally { setLoading(false) }
    }
    fetchMods()
  }, [])

  // [NEW] Pag binuksan yung module at maiksi / walang laman, kunin yung totoong article
  useEffect(() => {
    if (openMod === null) return
    const m = mods[openMod]
    if (!m || !m.link) return
    const needsContent = !m.d || m.d.startsWith('See resource:') || m.d.length < 150
    if (!needsContent) return
    setLoadingContent(true)
    fetch(`${BASE}/modules/fetch_metadata.php?url=${encodeURIComponent(m.link)}&full=1`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.content) {
          setMods(prev => prev.map((x, idx) => idx === openMod ? { ...x, d: data.content } : x))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingContent(false))
  }, [openMod])

  const q = search.toLowerCase()
  const filtered = mods
    .filter(m => filter === 'all' || m.c === filter)
    .filter(m => (m.t || '').toLowerCase().includes(q) || (m.d || '').toLowerCase().includes(q) || (m.source || '').toLowerCase().includes(q))

  const markRead = (id) => {
    setRead(prev => { const next = new Set(prev); next.add(id); return next })
    showToast?.('Module marked as read!')
  }

  const readCount = mods.filter(m => read.has(m.id)).length
  const pct = mods.length ? Math.round((readCount / mods.length) * 100) : 0

  if (loading) return <div className="p-10 text-center text-[13px] text-gray-400 w-full">Loading modules...</div>

  // ---------- Detail View ----------
  if (openMod !== null) {
    const m = mods[openMod]
    if (!m) return null
    const isDone = read.has(m.id)
    return (
      <div className="bg-[#f6f8f7] w-full">
        <div className="bg-[#085041] px-6 md:px-10 py-8 md:py-10 text-white">
          <p className="text-[10px] font-bold tracking-widest text-white/40">MODULE {String(m.gi).padStart(2, '0')} <span className="mx-1.5 text-white/30">|</span> {(catLabel[m.c] || 'Academic')?.toUpperCase()}</p>
          <h2 className="text-[28px] md:text-[36px] font-bold mt-3 leading-[1.05] max-w-[800px] tracking-tight">{m.t}</h2>
          {m.source && <p className="text-[11px] font-bold tracking-widest text-white/40 mt-4">SOURCE — {m.source.toUpperCase()}</p>}
        </div>

        <div className="px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 max-w-[1280px] mx-auto">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-7">
              <p className="text-[11px] font-bold text-[#085041] tracking-widest">OVERVIEW</p>

              {/* [FIX] DITO NA MISMO BABASAHIN - HINDI NA KAILANGAN MAG-NEW TAB */}
              {loadingContent ? (
                <p className="text-[14px] text-gray-400 mt-3 animate-pulse">Loading article content...</p>
              ) : renderContent(m.d) ? (
                renderContent(m.d)
              ) : (
                <p className="text-[14px] text-gray-500 leading-relaxed mt-2">No preview available for this module. You can read the full article from the source below.</p>
              )}

              {/* [FIX] VIEW SOURCE - NASA PINAKABABA LANG, PANG-REFERENCE LANG */}
              {m.link && (
                <div className="mt-8 pt-5 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-3">Original source for reference:</p>
                  <a href={m.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white border border-[#085041] text-[#085041] text-[13px] font-bold px-5 py-2.5 rounded-full hover:bg-[#E8F5F1]">
                    View Source — {m.source || 'External Link'} ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 h-fit lg:sticky lg:top-[84px]">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-gray-400">PROGRESS</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isDone ? 'bg-[#E8F5F1] text-[#085041]' : 'bg-amber-100 text-amber-800'}`}>{isDone ? 'Completed' : 'In Progress'}</span>
              </div>
              {/* [FIX] Tinanggal na yung Open Source Link dito - nasa baba na lang */}
              <button onClick={() => !isDone && markRead(m.id)} className={`w-full py-3.5 rounded-full text-[14px] font-bold mt-4 ${isDone ? 'bg-[#E8F5F1] text-[#085041]' : 'bg-[#085041] text-white'}`}>{isDone ? '✓ Marked as Read' : 'Mark as Read'}</button>
              <button onClick={() => setOpenMod(null)} className="w-full py-3 rounded-full text-[13px] font-semibold border border-gray-200 text-gray-700 mt-2.5">← Back</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------- List View ----------
  return (
    <div className="bg-[#f6f8f7] w-full">
      <div className="bg-[#085041] px-6 md:px-10 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between shrink-0">
        <div className="flex-1">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-[0.95] tracking-tight">Information Service</h2>
          <p className="text-[13px] md:text-[14px] text-white/70 mt-3 max-w-[460px]">Self-paced guides for academics, emotions, and career — read anytime, at your own pace.</p>
        </div>
        <div className="w-full lg:w-[360px] bg-[#0a5a49] border border-white/10 rounded-2xl p-5">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-3">YOUR PROGRESS</p>
          <div className="flex justify-between items-end">
            <p className="text-[24px] font-bold text-white">{readCount}/{mods.length}</p>
            <p className="text-[12px] text-white/60">{pct}% completed</p>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden mt-3"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="px-4 md:px-10 pt-6 flex flex-col md:flex-row gap-3 max-w-[1280px] mx-auto w-full">
        <div className="flex-1 flex items-center gap-2.5 bg-white border rounded-full px-5 py-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules..." className="text-[14px] w-full bg-transparent outline-none" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400">×</button>}
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white border rounded-full px-5 py-3 text-[13px] font-bold">
          {filters.map(f => <option key={f} value={f}>{filterLabels[f]}</option>)}
        </select>
      </div>

      <div className="px-4 md:px-10 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10 max-w-[1280px] mx-auto">
        {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400 text-[14px] bg-white border rounded-2xl">No modules yet</div>}
        {filtered.map(m => {
          const realIdx = mods.findIndex(x => x.id === m.id)
          const isRead = read.has(m.id)
          return (
            <button key={m.id} onClick={() => setOpenMod(realIdx)} className="bg-white border rounded-2xl p-6 text-left hover:shadow-[0_12px_32px_rgba(8,80,65,0.14)] hover:-translate-y-[1px] transition-all flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold tracking-widest text-[#085041]/60">MODULE {String(m.gi).padStart(2, '0')}</p>
                {isRead && <span className="text-[10px] font-bold text-[#085041] bg-[#E8F5F1] px-2.5 py-1 rounded-full">✓ Read</span>}
              </div>
              <h4 className="text-[15px] font-bold text-gray-900">{m.t}</h4>
              <p className="text-[13px] text-gray-500 mt-2 flex-1 line-clamp-3">{m.d}</p>
              {m.source && <p className="text-[11px] font-bold text-[#085041] mt-3">Source — {m.source} ↗</p>}
              <div className="flex items-center justify-between mt-5">
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${catStyle[m.c]}`}>{catLabel[m.c]}</span>
                <span className="text-[12px] font-bold text-[#085041]">Read →</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}