import { useState, useEffect } from 'react'

const mods = [
  { c: 'academic', t: 'Study Skills & Time Management', d: 'Master the art of studying smarter, not harder.' },
  { c: 'academic', t: 'Test Anxiety Management', d: 'Strategies to overcome anxiety and perform better during examinations.' },
  { c: 'academic', t: 'Note-Taking Strategies', d: 'Methods for efficient, organized note-taking in any learning environment.' },
  { c: 'academic', t: 'Goal Setting for Students', d: 'How to set SMART academic goals and stay on track to achieve them.' },
  { c: 'academic', t: 'Overcoming Procrastination', d: 'Identify triggers and apply proven techniques to break the habit.' },
  { c: 'social', t: 'Stress Management', d: 'Understanding stress responses and applying healthy coping mechanisms daily.' },
  { c: 'social', t: 'Emotional Intelligence', d: 'Develop self-awareness, empathy, and emotional regulation in relationships.' },
  { c: 'social', t: 'Healthy Relationships', d: 'Building positive, respectful relationships with peers, family, and faculty.' },
  { c: 'social', t: 'Mental Health Awareness', d: 'Recognize early signs of mental health challenges and know when to seek help.' },
  { c: 'social', t: 'Self-Esteem & Confidence', d: 'Building a positive self-image and the confidence to face academic life.' },
  { c: 'career', t: 'Career Exploration', d: 'Discover career paths that align with your strengths, values, and interests.' },
  { c: 'career', t: 'Resume & CV Writing', d: 'Create a professional, standout resume for internships and job applications.' },
  { c: 'career', t: 'Interview Skills', d: 'Prepare for job interviews with practical tips and mock questions.' },
  { c: 'career', t: 'Workplace Readiness', d: 'Essential professional skills for entering and thriving in the workforce.' },
  { c: 'career', t: 'Entrepreneurship Basics', d: 'Introduction to entrepreneurial thinking and opportunities for students.' },
]

const catLabel = { academic: 'Academic', social: 'Personal-Social-Emotional', career: 'Career' }
const catStyle = {
  academic: 'bg-[#e6f1fb] text-[#185FA5]',
  social: 'bg-[#E1F5EE] text-[#085041]',
  career: 'bg-[#ede9fe] text-[#3C3489]',
}
const filters = ['all', 'academic', 'social', 'career']
const filterLabels = { all: 'All', academic: 'Academic', social: 'Personal-Social-Emotional', career: 'Career' }

const STORAGE_KEY = 'gco_read_modules'
function loadRead() { try { const raw = localStorage.getItem(STORAGE_KEY); return raw? new Set(JSON.parse(raw)) : new Set() } catch { return new Set() } }
function saveRead(set) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])) } catch {} }

export default function Modules({ showToast }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [openMod, setOpenMod] = useState(null)
  const [read, setRead] = useState(loadRead)
  useEffect(() => { saveRead(read) }, [read])

  const filtered = mods
 .map((m, i) => ({...m, gi: i + 1 }))
 .filter(m => filter === 'all' || m.c === filter)
 .filter(m => m.t.toLowerCase().includes(search.toLowerCase()) || m.d.toLowerCase().includes(search.toLowerCase()))

  const markRead = (idx) => {
    setRead(prev => { const next = new Set(prev); next.add(idx); return next })
    showToast?.('✅ Module marked as read!')
  }

  if (openMod!== null) {
    const m = mods[openMod]
    const isDone = read.has(openMod)
    return (
      <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)]">
        <div className="bg-[#085041] px-6 md:px-10 py-8 md:py-10 text-white">
          <p className="text-[10px] font-bold tracking-widest text-white/40">MODULE {String(openMod+1).padStart(2,'0')} • {catLabel[m.c].toUpperCase()}</p>
          <h2 className="text-[28px] md:text-[36px] font-bold mt-2 leading-[1.05] max-w-[800px] tracking-tight">{m.t}</h2>
          <p className="text-[13px] md:text-[14px] text-white/60 mt-3 max-w-[600px] leading-relaxed">{m.d}</p>
        </div>
        <div className="px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 max-w-[1280px] mx-auto">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-[11px] font-bold text-[#085041] tracking-widest">OVERVIEW</p>
              <p className="text-[14px] text-gray-700 leading-relaxed mt-2">This module covers essential strategies related to <strong>{m.t.toLowerCase()}</strong>. Developed by GCO to help CvSU Imus students thrive academically, personally, and professionally.</p>
            </div>
            {['Key Concepts','Practical Tips'].map((sec) => (
              <div key={sec} className="bg-white border border-gray-200 rounded-2xl p-6 group">
                <h3 className="text-[13px] font-bold text-gray-900 group-hover:text-[#085041] transition-colors">{sec}</h3>
                <ul className="mt-3 space-y-2.5">
                  {(sec === 'Key Concepts'? [
                    'Understanding the fundamentals of ' + m.t.toLowerCase(),
                    'Recognizing how this affects your academic and personal life',
                    'Learning evidence-based approaches used by students'
                  ] : [
                    'Start small, apply one new strategy this week',
                    'Track your progress in a journal or planner',
                    'Reach out to the GCO if you need support'
                  ]).map((pt,i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-gray-600 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[#E8F5F1] text-[#085041] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>{pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-[13px] font-bold text-gray-900">Reflection</h3>
              <div className="bg-[#f6f8f7] rounded-xl p-4 mt-3 border border-gray-100">
                <p className="text-[13px] text-gray-600 italic leading-relaxed">How does <strong>{m.t.toLowerCase()}</strong> affect your daily life? What is one thing you can do differently starting today?</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 h-fit lg:sticky lg:top-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-gray-400">PROGRESS</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isDone? 'bg-[#E8F5F1] text-[#085041]' : 'bg-amber-100 text-amber-800'}`}>{isDone? 'Completed' : 'In Progress'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-4 overflow-hidden"><div className={`h-full transition-all duration-500 ${isDone? 'w-full bg-[#085041]' : 'w-1/2 bg-amber-400'}`}/></div>
              <button onClick={() =>!isDone && markRead(openMod)} className={`w-full py-3.5 rounded-full text-[14px] font-bold mt-6 transition-all active:scale-[0.98] ${isDone? 'bg-[#E8F5F1] text-[#085041]' : 'bg-[#085041] text-white hover:bg-[#0a5a49]'}`}>
                {isDone? '✓ Marked as Read' : 'Mark as Read'}
              </button>
              <button onClick={() => setOpenMod(null)} className="w-full py-3 rounded-full text-[13px] font-semibold border border-gray-200 text-gray-700 mt-2.5 hover:bg-gray-50">← Back to Modules</button>
            </div>
            <div className="bg-[#085041] rounded-2xl p-6 text-white">
              <p className="text-[10px] font-bold tracking-widest text-white/50">NEED HELP?</p>
              <p className="text-[13px] text-white/80 mt-2 leading-relaxed">Confidential counseling available for all students.</p>
              <div className="mt-4 bg-white/10 border border-white/10 rounded-xl p-3 text-[11px] text-white/70 leading-relaxed">Admin Bldg, Ground Floor<br/>8AM-12PM, 1PM-5PM<br/>cvsuimus.guidance@cvsu.edu.ph</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const readCount = [...read].filter(i => i < mods.length).length
  return (
    <div className="bg-[#f6f8f7] min-h-[calc(100vh-64px)]">
      {/* HEADER - GITNA NA, WALANG REDUNDANT CHIPS */}
      <div className="bg-[#085041] px-6 md:px-10 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between shrink-0">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-[0.95] tracking-tight">Information Service</h2>
          <p className="text-[13px] md:text-[14px] text-white/70 mt-3 max-w-[460px] leading-relaxed">Browse and read modules across all three guidance tracks. Self-paced resources to help you thrive academically and emotionally.</p>
        </div>
        <div className="w-full lg:w-[360px] bg-[#0a5a49] border border-white/10 rounded-2xl p-5 shrink-0">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-3">YOUR PROGRESS</p>
          <div className="flex justify-between items-end">
            <p className="text-[24px] font-bold text-white leading-none">{readCount}/{mods.length}</p>
            <p className="text-[12px] text-white/60 mb-1">{Math.round((readCount / mods.length) * 100) || 0}% completed</p>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden mt-3"><div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${(readCount / mods.length) * 100}%` }}/></div>
          <p className="text-[10px] text-white/50 mt-3">Keep reading. Every module helps.</p>
        </div>
      </div>

      <div className="px-4 md:px-10 pt-6 flex flex-col md:flex-row gap-3 max-w-[1280px] mx-auto w-full">
        <div className="flex-1 flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-5 py-3 focus-within:border-[#085041]/30 hover:border-gray-300 transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.8} className="w-[18px] h-[18px] flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules, e.g. Stress Management..." className="text-[14px] text-gray-900 w-full bg-transparent outline-none placeholder:text-gray-400"/>
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-[18px] leading-none px-1">×</button>}
        </div>
        <div className="relative w-full md:w-[260px]">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="appearance-none w-full bg-white border border-gray-200 rounded-full px-5 py-3 pr-10 text-[13px] font-bold text-gray-700 outline-none cursor-pointer">
            {filters.map(f => <option key={f} value={f}>{filterLabels[f]}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5"><svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={2.5} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10 max-w-[1280px] mx-auto">
        {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400 text-[14px] bg-white border border-gray-200 rounded-2xl">No modules found for "<strong>{search}</strong>"</div>}
        {filtered.map(m => (
          <button key={m.gi} onClick={() => setOpenMod(m.gi - 1)} className="bg-white border border-gray-200 rounded-2xl p-6 text-left group hover:shadow-[0_12px_32px_rgba(8,80,65,0.14)] hover:-translate-y-[1px] transition-all flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest text-[#085041]/60">MODULE {String(m.gi).padStart(2, '0')}</p>
              {read.has(m.gi - 1) && <span className="text-[10px] font-bold text-[#085041] bg-[#E8F5F1] px-2.5 py-1 rounded-full">✓ Read</span>}
            </div>
            <h4 className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-[#085041] transition-colors">{m.t}</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed mt-2.5 flex-1">{m.d}</p>
            <div className="flex items-center justify-between mt-5">
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${catStyle[m.c]}`}>{catLabel[m.c]}</span>
              <span className="text-[12px] font-bold text-[#085041] flex items-center gap-1 group-hover:gap-2 transition-all">Read <span className="group-hover:translate-x-1 transition-transform">→</span></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}