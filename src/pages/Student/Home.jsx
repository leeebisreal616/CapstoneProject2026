import { useState, useEffect, useMemo } from 'react'
import { IconCounseling, IconModules, IconAssessment, IconChevronRight } from '../../components/Icons'

// LOCAL: D:\xampp\htdocs\gco-api
const BASE = 'http://localhost/gco-api'
// LIVE: InfinityFree - ibalik mo to pag magde-deploy ka
// const BASE = 'https://gco-api.infinityfreeapp.com'

const PHRASES = [
  'Your well-being is our priority.',
  'You are not alone here.',
  'Confidential. Free. Here for you.',
  'Take a breath. We are here to listen.',
]

const CARDS = [
  { id: 'counseling', title: 'Counseling', desc: 'Book a one-on-one session. Confidential and free.', Icon: IconCounseling, cta: 'Book a session' },
  { id: 'assessment', title: 'Initial Assessment', desc: 'Required first step before booking. 5-10 mins only.', Icon: IconAssessment, cta: 'Start assessment' },
  { id: 'modules', title: 'Wellness Modules', desc: 'Self-paced resources for academic and emotional well-being.', Icon: IconModules, cta: 'Browse modules' },
]

function Divider() { return <span className="hidden sm:block w-px h-3.5 bg-gray-300 shrink-0" /> }

// Safe date - pag invalid galing DB, hindi mag-NaN
function getAnnDate(raw) {
  if (!raw) return null
  const d = new Date(raw)
  if (isNaN(d.getTime())) return null
  return d
}

function useTypewriter(phrases, typeSpeed = 65, pauseTime = 2200) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length]
    let delay = isDeleting ? 28 : typeSpeed
    if (!isDeleting && text === current) {
      const t = setTimeout(() => setIsDeleting(true), pauseTime)
      return () => clearTimeout(t)
    }
    if (isDeleting && text === '') {
      setIsDeleting(false)
      setPhraseIndex(p => (p + 1) % phrases.length)
      return
    }
    const t = setTimeout(() => {
      setText(current.slice(0, isDeleting ? text.length - 1 : text.length + 1))
    }, delay)
    return () => clearTimeout(t)
  }, [text, isDeleting, phraseIndex, phrases, typeSpeed, pauseTime])
  return text
}

function HeroTitle() {
  const typed = useTypewriter(PHRASES)
  return (
    <h1 className="text-[36px] md:text-[44px] font-bold leading-[1.08] tracking-tight min-h-[52px]">
      {typed}
      <span className="inline-block w-[3px] h-[32px] md:h-[38px] bg-white ml-1 align-middle animate-pulse rounded-full" />
    </h1>
  )
}

export default function Home({ navigate }) {
  const [announcements, setAnnouncements] = useState([])
  const [student] = useState(() => {
    try { const saved = localStorage.getItem('student'); return saved ? JSON.parse(saved) : null } catch { return null }
  })

  const handleLogout = () => {
    // Lahat ng student data, hindi lang student + student_id
    ;['student', 'student_id', 'studentId', 'user', 'gco_user', 'gco_student_profile_done', 'gco_read_modules'].forEach(k => localStorage.removeItem(k))
    navigate('login')
  }

  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const res = await fetch(`${BASE}/announcements/get_announcements.php`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.announcements || data.data || data.result || []
        const published = list.filter(a => String(a.status || '').toLowerCase() === 'published')
        setAnnouncements(published.slice(0, 3))
      } catch { setAnnouncements([]) }
    }
    fetchPublished()
  }, [])

  const studentName = student?.full_name || student?.name || ''
  const studentId = student?.student_id || student?.student_number || ''
  const studentInitial = studentName ? studentName.charAt(0).toUpperCase() : 'S'

  // Iwas 3x na new Date() per announcement
  const annList = useMemo(() => announcements.map((a, idx) => {
    const d = getAnnDate(a.created_at)
    return {
      ...a, key: a.id || a.announcement_id || idx,
      day: d ? d.getDate() : 'NEW',
      month: d ? d.toLocaleString('en-US', { month: 'short' }) : 'PINNED',
      fullDate: d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (a.date || ''),
      isLatest: idx === 0,
    }
  }), [announcements])

  return (
    <div className="bg-[#f6f8f7] w-full flex flex-col">
      {/* Top */}
      <div className="bg-[#085041] text-white px-6 md:px-10 py-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
        <div className="flex-1 w-full">
          <HeroTitle />
          <p className="text-[15px] md:text-[16px] text-white/75 leading-relaxed max-w-[480px] mt-3">Guidance and counseling portal for CvSU Imus students. Free, confidential, Mon to Thurs.</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => navigate('assessment')} className="bg-white text-[#085041] text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:-translate-y-[1px] active:scale-[0.98]">Take Assessment</button>
            <button onClick={() => navigate('counseling')} className="bg-white/10 border border-white/20 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-white/15 hover:border-white/30 hover:-translate-y-[1px] active:scale-[0.98]">Book Now</button>
          </div>
        </div>

        {/* Right card */}
        <div className="w-full md:w-[360px] shrink-0 bg-[#0a5a49] border border-white/10 rounded-2xl p-4 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:border-white/20">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-3">GUIDANCE & COUNSELING OFFICE</p>
          <div className="space-y-2 text-[12px]">
            <div className="flex gap-3"><span className="text-white/40 w-[50px] shrink-0">Location</span><span className="text-white">New Bldg, Ground Floor</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px] shrink-0">Hours</span><span className="text-white">Mon to Thurs, 7AM-4PM</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px] shrink-0">Email</span><span className="text-white text-[11px] break-all">cvsuimus.guidance@cvsu.edu.ph</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px] shrink-0">Facebook</span><a href="https://www.facebook.com/GCOCvSUImus" target="_blank" rel="noreferrer" className="text-white underline decoration-white/20 hover:decoration-white transition-all">GCOCvSUImus</a></div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-[10px] font-bold text-amber-200/70 tracking-wider mb-2">NCMH CRISIS HOTLINE</p>
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-[#085041] text-[11px] font-bold px-2.5 py-1 rounded-md">1553</span>
              <span className="text-[12px] font-semibold text-white">1800-1888-1553</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-white/60">
                <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/80 w-[48px] text-center">SMART</span>
                <span>0919 057 1553</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/60">
                <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/80 w-[48px] text-center">GLOBE</span>
                <span>0917 899 8727</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="px-4 md:px-10 pt-5">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between px-5 md:px-6 py-3.5 bg-[#FFFBEB] border-b border-amber-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#92400E]">ANNOUNCEMENTS</p>
              {annList.length > 0 && <span className="text-[10px] font-bold bg-[#085041] text-white px-2 py-0.5 rounded-full">{annList.length} NEW</span>}
            </div>
          </div>

          {annList.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {annList.map(a => (
                <div key={a.key} className="group flex gap-4 px-5 md:px-6 py-4 hover:bg-[#FFFBEB]/60 transition-colors duration-150">
                  <div className="hidden sm:flex flex-col items-center justify-center w-[52px] h-[52px] shrink-0 rounded-xl bg-[#E8F5F1] border border-[#085041]/10 text-center">
                    <span className="text-[16px] font-extrabold leading-none text-[#085041]">{a.day}</span>
                    <span className="text-[9px] font-bold tracking-widest text-[#085041]/60 mt-1 uppercase">{a.month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-bold text-gray-900 leading-snug group-hover:text-[#085041] transition-colors">{a.title || a.titulo || 'Announcement'}</p>
                      {a.isLatest && <span className="shrink-0 text-[9px] font-extrabold tracking-widest bg-amber-100 text-amber-800 px-2 py-1 rounded-full">LATEST</span>}
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed mt-1 line-clamp-2">{a.description || a.desc || a.content || ''}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1.5"><span>📍</span> Guidance & Counseling Office</span>
                      {a.fullDate && <><Divider /><span>{a.fullDate}</span></>}
                      {a.created_by_name && <><Divider /><span>by {a.created_by_name}</span></>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-5 flex items-center gap-3">
              <span className="text-[18px]">📢</span>
              <p className="text-[13px] text-gray-500">No new announcements at the moment. Check back soon for updates from GCO.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 3 cards */}
      <div className="px-4 md:px-10 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map(item => (
          <button key={item.id} onClick={() => navigate(item.id)} className="bg-white rounded-2xl border border-gray-200 p-6 text-left group cursor-pointer flex flex-col transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[2px] active:scale-[0.99]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] flex items-center justify-center text-[#085041] mb-4 transition-all duration-200 group-hover:bg-[#085041] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(8,80,65,0.2)]">
              <item.Icon className="w-5 h-5" />
            </div>
            <p className="text-[15px] font-bold text-gray-900">{item.title}</p>
            <p className="text-[13px] text-gray-500 mt-1 flex-1 leading-relaxed">{item.desc}</p>
            <p className="text-[12px] font-semibold text-[#085041] mt-4 flex items-center gap-1 transition-all duration-200 group-hover:gap-2">
              {item.cta} <span className="transition-transform duration-200 group-hover:translate-x-1"><IconChevronRight stroke="#085041" /></span>
            </p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 md:px-10 py-5 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-[12px]">
          <span className="text-gray-500">Est. 2003</span>
          <Divider />
          <span className="text-gray-500">Free and confidential for all enrolled students</span>
        </div>
        <div className="flex items-center gap-3">
          {student && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#085041] text-white flex items-center justify-center font-bold text-[13px] shrink-0">{studentInitial}</div>
              <div className="leading-tight text-left">
                <p className="text-[13px] font-bold text-gray-900 truncate max-w-[140px]">{studentName || 'Student'}</p>
                <p className="text-[11px] text-gray-500"><span className="font-semibold tracking-wide text-gray-400 text-[10px]">STUDENT NO. </span>{studentId}</p>
              </div>
              <span className="w-px h-8 bg-gray-200 mx-1 hidden sm:block" />
            </div>
          )}
          <button onClick={handleLogout} className="text-[12px] font-semibold text-gray-600 hover:text-[#085041] border border-gray-200 hover:border-[#085041]/30 bg-white hover:bg-[#E8F5F1] px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap">Logout</button>
        </div>
      </div>
    </div>
  )
}