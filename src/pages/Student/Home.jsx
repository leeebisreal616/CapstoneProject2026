import { useState, useEffect } from 'react'
import { IconCounseling, IconModules, IconAssessment, IconChevronRight } from '../../components/Icons'
const BASE = 'http://localhost/gco-api'
export default function Home({ navigate }) {
  const [announcements, setAnnouncements] = useState([])
  const [student] = useState(() => {
    const saved = localStorage.getItem('student')
    return saved ? JSON.parse(saved) : null
  })
  // LOGOUT - balik sa login
  const handleLogout = () => {
    localStorage.removeItem('student')
    localStorage.removeItem('student_id')
    navigate('login')
  }
  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const res = await fetch(`${BASE}/announcements/get_announcements.php`)
        const data = await res.json()
        // [FIX] Tanggapin lahat ng format: array, {announcements:[]}, {data:[]}
        const list = Array.isArray(data) ? data : data.announcements || data.data || data.result || []
        const published = list.filter(a => {
          const s = (a.status || '').toLowerCase()
          return s === 'published'
        })
        setAnnouncements(published.slice(0, 3))
      } catch (e) { setAnnouncements([]) }
    }
    fetchPublished()
  }, [])
  return (
    // [FIX] Dati: min-h-[calc(100vh-64px)] - pinipilit na maging viewport height, kaya nahahati yung scroll.
    // Ngayon: w-full lang - hayaan yung App.jsx (flex-col + sticky Topbar) yung mag-scroll ng buong page.
    <div className="bg-[#f6f8f7] w-full flex flex-col">
      {/* Top */}
      <div className="bg-[#085041] text-white px-6 md:px-10 py-7 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <h1 className="text-[32px] md:text-[38px] font-bold leading-[1.05]">Your well-being is<br/>our priority</h1>
          <p className="text-[13px] text-white/60 mt-3 max-w-[380px]">Guidance and counseling portal for CvSU Imus students. Free, confidential, Mon to Fri.</p>
          <div className="flex gap-2 mt-5">
            <button onClick={() => navigate('assessment')} className="bg-white text-[#085041] text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:-translate-y-[1px] active:scale-[0.98]">Take Assessment</button>
            <button onClick={() => navigate('counseling')} className="bg-white/10 border border-white/20 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-white/15 hover:border-white/30 hover:-translate-y-[1px] active:scale-[0.98]">Book Now</button>
          </div>
        </div>
        {/* Right card */}
        <div className="w-full md:w-[360px] bg-[#0a5a49] border border-white/10 rounded-2xl p-4 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:border-white/20">
          <p className="text-[10px] font-bold tracking-widest text-white/40 mb-3">GUIDANCE & COUNSELING OFFICE</p>
          <div className="space-y-2 text-[12px]">
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Location</span><span className="text-white">Admin Bldg, Ground Floor</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Hours</span><span className="text-white">8AM-12PM, 1PM-5PM</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Email</span><span className="text-white text-[11px]">cvsuimus.guidance@cvsu.edu.ph</span></div>
            <div className="flex gap-3"><span className="text-white/40 w-[50px]">Facebook</span><a href="https://www.facebook.com/GCOCvSUImus" target="_blank" className="text-white underline decoration-white/20 hover:decoration-white transition-all">GCOCvSUImus</a></div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-[10px] font-bold text-amber-200/70 tracking-wider mb-1.5">NCMH CRISIS HOTLINE</p>
            <div className="flex gap-2">
              <span className="bg-white text-[#085041] text-[11px] font-bold px-2 py-1 rounded transition-all hover:shadow-[0_2px_8px_rgba(255,255,255,0.2)]">1553</span>
              <span className="text-[11px] text-white/80 py-1">1800-1888-1553</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1.5">09190571553 (Smart) • 09178998727 (Globe/TM)</p>
          </div>
        </div>
      </div>
      {/* LIVE ANNOUNCEMENTS - PROFESSIONAL, GALING ADMIN */}
      <div className="px-4 md:px-10 pt-5">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 md:px-6 py-3.5 bg-[#FFFBEB] border-b border-amber-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#92400E]">ANNOUNCEMENTS</p>
              {announcements.length > 0 && <span className="text-[10px] font-bold bg-[#085041] text-white px-2 py-0.5 rounded-full">{announcements.length} NEW</span>}
            </div>
            <p className="text-[11px] font-medium text-gray-400 hidden sm:block">From Guidance & Counseling Office</p>
          </div>
          {/* List */}
          {announcements.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {announcements.map((a, idx) => (
                <div key={a.id || a.announcement_id || idx} className="group flex gap-4 px-5 md:px-6 py-4 hover:bg-[#FFFBEB]/60 transition-colors duration-150">
                  {/* Date badge */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-[52px] h-[52px] shrink-0 rounded-xl bg-[#E8F5F1] border border-[#085041]/10 text-center">
                    <span className="text-[16px] font-extrabold leading-none text-[#085041]">{a.created_at ? new Date(a.created_at).getDate() : '•'}</span>
                    <span className="text-[9px] font-bold tracking-widest text-[#085041]/60 mt-1 uppercase">{a.created_at ? new Date(a.created_at).toLocaleString('en-US', { month: 'short' }) : 'NEW'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-bold text-gray-900 leading-snug group-hover:text-[#085041] transition-colors">{a.title || a.titulo || 'Announcement'}</p>
                      {idx === 0 && <span className="shrink-0 text-[9px] font-extrabold tracking-widest bg-amber-100 text-amber-800 px-2 py-1 rounded-full">LATEST</span>}
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed mt-1 line-clamp-2">{a.description || a.desc || a.content || ''}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5">
                      <span>📍 Guidance & Counseling Office</span>
                      <span>•</span>
                      <span>{a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : a.date || ''}</span>
                      {a.created_by_name && <><span>•</span><span>by {a.created_by_name}</span></>}
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
      {/* Bottom 3 cards - SAME HOVER AS ASSESSMENT */}
      <div className="px-4 md:px-10 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id:'counseling', title:'Counseling', desc:'Book a one-on-one session. Confidential and free.', Icon: IconCounseling, cta:'Book a session' },
          { id:'assessment', title:'Initial Assessment', desc:'Required first step before booking. 5-10 mins only.', Icon: IconAssessment, cta:'Start assessment' },
          { id:'modules', title:'Wellness Modules', desc:'Self-paced resources for academic and emotional well-being.', Icon: IconModules, cta:'Browse modules' },
        ].map(item => (
          <button key={item.id} onClick={() => navigate(item.id)} className="bg-white rounded-2xl border border-gray-200 p-6 text-left group cursor-pointer flex flex-col transition-all duration-200 hover:shadow-[0_8px_24px_rgba(8,80,65,0.12)] hover:border-[#085041]/20 hover:-translate-y-[2px] active:scale-[0.99]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] flex items-center justify-center text-[#085041] mb-4 transition-all duration-200 group-hover:bg-[#085041] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(8,80,65,0.2)]">
              <item.Icon className="w-5 h-5"/>
            </div>
            <p className="text-[15px] font-bold text-gray-900">{item.title}</p>
            <p className="text-[13px] text-gray-500 mt-1 flex-1 leading-relaxed">{item.desc}</p>
            <p className="text-[12px] font-semibold text-[#085041] mt-4 flex items-center gap-1 transition-all duration-200 group-hover:gap-2">
              {item.cta} <span className="transition-transform duration-200 group-hover:translate-x-1"><IconChevronRight stroke="#085041" /></span>
            </p>
          </button>
        ))}
      </div>
      {/* Footer - MAY LOGOUT NA SA LOWER RIGHT, HINDI CORNY */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-gray-400 leading-relaxed text-center md:text-left">
          CvSU Imus Campus • Est. 2004 • Free and confidential for all enrolled students {student && <span className="hidden md:inline"> • {student.full_name || student.student_id}</span>}
        </p>
        <div className="flex items-center gap-3">
          {student && <span className="text-[11px] text-gray-500 hidden md:block">{student.student_id}</span>}
          <button onClick={handleLogout} className="text-[11px] font-semibold text-gray-500 hover:text-[#085041] border border-gray-200 hover:border-[#085041]/20 bg-white hover:bg-[#E8F5F1] px-4 py-1.5 rounded-full transition-all duration-200"> Logout </button>
        </div>
      </div>
    </div>
  )
}