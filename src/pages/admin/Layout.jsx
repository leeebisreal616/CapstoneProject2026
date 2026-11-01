// ============ LAYOUT - SIDEBAR + TOPBAR (2 in 1) - FIXED ============
import { useState } from 'react'

// ============ ICONS ============
const Icon = {
  overview: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10m-9 11h4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  appointments: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  submissions: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  content: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  students: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 1.13a4 4 0 00-3-3.87M17 12a4 4 0 100-8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  menu: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  logout: (c) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

// ============ NAV ITEMS CONFIG ============
const navItems = [
  { id: 'overview', label: 'Overview', icon: Icon.overview },
  { id: 'appointments', label: 'Appointments', icon: Icon.appointments, countKey: 'appointments' },
  { id: 'submissions', label: 'Student Submissions', icon: Icon.submissions, countKey: 'submissions' },
  { id: 'content', label: 'Content Management', icon: Icon.content },
  { id: 'students', label: 'Students Directory', icon: Icon.students },
]

// ============ SIDEBAR COMPONENT ============
export function Sidebar({ view, setView, mobileOpen, setMobileOpen, onLogout, counts }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#085041] flex flex-col z-50 transition-transform lg:translate-x-0 ${mobileOpen? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src="/gco-seal.png" alt="GCO Seal" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold leading-tight">GCO Admin</p>
            <p className="text-white/50 text-[11px]">CvSU Imus Campus</p>
          </div>
          <button className="ml-auto lg:hidden text-white/70" onClick={() => setMobileOpen(false)}>{Icon.x('w-5 h-5')}</button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider px-3 mb-2">Modules</p>
          <div className="flex flex-col gap-1">
            {navItems.map(item => {
              const count = item.countKey? counts[item.countKey] || 0 : 0
              return (
                <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false) }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${view === item.id? 'bg-white text-[#085041] font-semibold shadow-sm' : 'text-white/75 hover:bg-white/10'}`}>
                  {item.icon('w-[18px] h-[18px] flex-shrink-0')}
                  <span className="flex-1 text-left">{item.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${view === item.id? 'bg-[#085041] text-white' : 'bg-white/20 text-white'}`}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-[11px] font-bold">JM</div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-[12px] font-semibold truncate">Jervin M.</p>
              <p className="text-white/50 text-[10px] truncate">Guidance Counselor</p>
            </div>
            <button onClick={onLogout} className="text-white/50 hover:text-white">{Icon.logout('w-4 h-4')}</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============ TOPBAR COMPONENT - FIXED (WALA NANG DOUBLE HEADER) ============
export function Topbar({ setMobileOpen }) {
  // NOTE: tinanggal title/subtitle props para di na mag double
  // Yung title nasa bawat page na mismo (Appointments.jsx, Content.jsx etc)
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 lg:hidden">
      <button className="text-gray-700" onClick={() => setMobileOpen(true)}>{Icon.menu('w-6 h-6')}</button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#085041] flex items-center justify-center overflow-hidden">
          <img src="/gco-seal.png" alt="GCO" className="w-5 h-5 object-cover rounded-full" />
        </div>
        <p className="text-[13px] font-bold text-gray-900">GCO Admin</p>
      </div>
    </div>
  )
}