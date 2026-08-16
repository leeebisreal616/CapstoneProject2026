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

function loadRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveRead(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])) } catch {}
}

export default function Modules({ showToast }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [openMod, setOpenMod] = useState(null)
  const [read, setRead] = useState(loadRead)

  useEffect(() => { saveRead(read) }, [read])

  const filtered = mods
    .map((m, i) => ({ ...m, gi: i + 1 }))
    .filter(m => filter === 'all' || m.c === filter)
    .filter(m =>
      m.t.toLowerCase().includes(search.toLowerCase()) ||
      m.d.toLowerCase().includes(search.toLowerCase())
    )

  const markRead = (idx) => {
    setRead(prev => {
      const next = new Set(prev)
      next.add(idx)
      return next
    })
    showToast?.('✅ Module marked as read!')
  }

  if (openMod !== null) {
    const m = mods[openMod]
    const isDone = read.has(openMod)
    return (
      <div>
        <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
          <h2 className="text-[20px] font-bold text-[#085041]">{m.t}</h2>
          <p className="text-[13px] text-[#0F6E56] mt-1">{catLabel[m.c]} Module</p>
        </div>
        <div className="px-4 py-5 max-w-2xl mx-auto">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${catStyle[m.c]} inline-block mb-3`}>
            {catLabel[m.c]}
          </span>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-5">{m.d}</p>

          <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-2xl p-4 mb-5">
            <p className="text-[13px] font-bold text-[#085041] uppercase tracking-wider mb-1">Overview</p>
            <p className="text-[14px] text-[#085041]/80 leading-relaxed">
              This module covers essential knowledge and practical strategies related to <strong>{m.t.toLowerCase()}</strong>.
              Developed by the GCO to help CvSU Imus students thrive academically, personally, and professionally.
            </p>
          </div>

          {['Key Concepts', 'Practical Tips', 'Reflection'].map((sec, si) => (
            <div key={si} className="mb-5">
              <h3 className="text-[14px] font-bold text-[#085041] mb-2 pb-2 border-b border-[#9FE1CB]">{sec}</h3>
              {sec === 'Key Concepts' && (
                <ul className="flex flex-col gap-2">
                  {[
                    'Understanding the fundamentals of ' + m.t.toLowerCase(),
                    'Recognizing how this affects your academic and personal life',
                    'Learning evidence-based approaches used by students and professionals'
                  ].map((pt, i) => (
                    <li key={i} className="flex gap-2 text-[14px] text-gray-700 leading-relaxed">
                      <span className="text-[#1D9E75] text-[10px] mt-1.5 flex-shrink-0">✦</span>{pt}
                    </li>
                  ))}
                </ul>
              )}
              {sec === 'Practical Tips' && (
                <ul className="flex flex-col gap-2">
                  {[
                    'Start small — apply one new strategy this week',
                    'Track your progress in a journal or planner',
                    'Reach out to the GCO if you need additional support'
                  ].map((pt, i) => (
                    <li key={i} className="flex gap-2 text-[14px] text-gray-700 leading-relaxed">
                      <span className="text-[#1D9E75] text-[10px] mt-1.5 flex-shrink-0">✦</span>{pt}
                    </li>
                  ))}
                </ul>
              )}
              {sec === 'Reflection' && (
                <div className="bg-[#f4f9f7] border border-[#d1e5de] rounded-xl p-4">
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    Take a moment to reflect: <em>How does <strong>{m.t.toLowerCase()}</strong> affect your daily life as a student?
                    What is one thing you can do differently starting today?</em>
                  </p>
                </div>
              )}
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wider mb-1">💡 Remember</p>
            <p className="text-[13px] text-amber-700 leading-relaxed">
              The GCO is here to support you. If this module raised concerns or you need to talk to someone,
              don't hesitate to book a counseling session.
            </p>
          </div>

          <button
            onClick={() => !isDone && markRead(openMod)}
            className={`w-full py-4 rounded-full text-[15px] font-semibold mb-3 transition-all ${isDone ? 'bg-[#e0ece8] text-[#085041] cursor-default' : 'bg-[#085041] text-white'}`}>
            {isDone ? '✓ Marked as Read' : 'Mark as Read'}
          </button>
          <button
            onClick={() => setOpenMod(null)}
            className="w-full py-3.5 rounded-full text-[14px] font-semibold border-[1.5px] border-[#9FE1CB] text-[#085041]">
            ← Back to Modules
          </button>
        </div>
      </div>
    )
  }

  const readCount = [...read].filter(i => i < mods.length).length

  return (
    <div>
      <div className="bg-[#E1F5EE] border-b border-[#9FE1CB] px-4 py-5">
        <h2 className="text-[20px] font-bold text-[#085041]">Information Service</h2>
        <p className="text-[13px] text-[#0F6E56] mt-1">
          Browse and read modules across all three guidance tracks.
          {readCount > 0 && <span className="ml-2 font-bold">{readCount}/{mods.length} read</span>}
        </p>
      </div>

      {/* Progress bar */}
      {readCount > 0 && (
        <div className="px-4 pt-4">
          <div className="flex justify-between text-[12px] font-semibold text-gray-500 mb-1.5">
            <span>Your Progress</span>
            <span>{Math.round((readCount / mods.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#085041] rounded-full transition-all duration-500"
              style={{ width: `${(readCount / mods.length) * 100}%` }}/>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2.5 bg-white border-[1.5px] border-[#d1e5de] rounded-full px-4 py-2.5 focus-within:border-[#1D9E75] focus-within:ring-2 focus-within:ring-[#1D9E75]/10 transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth={1.8} className="w-[18px] h-[18px] flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="text-[15px] text-gray-900 w-full bg-transparent outline-none placeholder:text-gray-400"/>
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-[18px] leading-none">×</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[13px] font-semibold px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 border-[1.5px] transition-all ${filter === f ? 'bg-[#085041] text-white border-[#085041]' : 'bg-white text-gray-500 border-[#d1e5de]'}`}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div className="px-4 pb-6 flex flex-col gap-3 md:grid md:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-10 text-gray-400 text-[14px]">
            No modules found for "<strong>{search}</strong>"
          </div>
        )}
        {filtered.map(m => (
          <button key={m.gi} onClick={() => setOpenMod(m.gi - 1)}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left transition-all hover:border-[#9FE1CB]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-[#1D9E75]">Module {String(m.gi).padStart(2, '0')}</p>
              {read.has(m.gi - 1) && (
                <span className="text-[10px] font-bold text-[#085041] bg-[#E1F5EE] px-2 py-0.5 rounded-full">✓ Read</span>
              )}
            </div>
            <h4 className="text-[14px] font-semibold text-gray-900 mb-1.5 leading-snug">{m.t}</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed">{m.d}</p>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${catStyle[m.c]}`}>{catLabel[m.c]}</span>
              <span className="text-[12px] font-semibold text-[#0F6E56]">Read →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}