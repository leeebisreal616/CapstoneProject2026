import { useState } from 'react'
import { logout } from '../../utils/adminAuth'
import Overview from './Overview'
import Appointments from './Appointments'
import InventorySubmissions from './Inventory'
import AssessmentResults from './Assessment'
import ModulesManagement from './Modules'
import AnnouncementsManagement from './Announcements'
import StudentDirectory from './StudentsDirectory'
// [ADD - REPORT] - Step 3
import AdminReport from './AdminReport'

const Icon = {
  overview: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10m-9 11h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  appointments: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  inventory: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  assessment: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  modules: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  announcements: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  students: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 1.13a4 4 0 00-3-3.87M17 12a4 4 0 100-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // [ADD - REPORT] - icon for Reports
  report: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M3 3v18h18M7 15v-4M11 19v-8M15 13V7M19 17v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  menu: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  x: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={c}>
      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  logout: (c) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={c}>
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: Icon.overview },
  { id: 'appointments', label: 'Appointments', icon: Icon.appointments },
  { id: 'inventory', label: 'Inventory', icon: Icon.inventory },
  { id: 'assessment', label: 'Assessment Results', icon: Icon.assessment },
  { id: 'modules', label: 'Modules', icon: Icon.modules },
  { id: 'announcements', label: 'Announcements', icon: Icon.announcements },
  { id: 'students', label: 'Students Directory', icon: Icon.students },
  // [ADD - REPORT] - lalabas sa sidebar
  { id: 'report', label: 'Reports', icon: Icon.report },
]

function Sidebar({ view, setView, mobileOpen, setMobileOpen, onLogout }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-screen w-[240px] bg-[#085041] flex flex-col z-50 transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky`}>
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
            <img src="/gco-seal.png" alt="GCO" className="w-full h-full object-cover" />
          </div>
          <p className="text-white text-[12px] font-semibold leading-tight">GCO Admin</p>
          <button className="ml-auto lg:hidden w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70" onClick={() => setMobileOpen(false)}>
            {Icon.x('w-3.5 h-3.5')}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setMobileOpen(false) }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-colors ${isActive ? 'bg-white text-[#085041]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                {item.icon('w-[16px] h-[16px]')}
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </div>
        <div className="border-t border-white/10 px-2.5 py-3">
          <button onClick={onLogout} className="flex items-center gap-2 text-white/50 text-[11px] px-2.5 py-1.5 rounded-lg w-full hover:text-white hover:bg-white/10 transition-colors">
            {Icon.logout('w-3.5 h-3.5')} Logout
          </button>
        </div>
      </div>
    </>
  )
}

export default function AdminDashboard({ onLogout }) {
  const [view, setView] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const views = {
    overview: <Overview setView={setView} />,
    appointments: <Appointments />,
    inventory: <InventorySubmissions />,
    assessment: <AssessmentResults />,
    modules: <ModulesManagement />,
    announcements: <AnnouncementsManagement />,
    students: <StudentDirectory />,
    // [ADD - REPORT]
    report: <AdminReport />,
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8f7]">
      <Sidebar view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={() => { logout(); onLogout?.() }} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2.5">
          <button className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600" onClick={() => setMobileOpen(true)}>
            {Icon.menu('w-4 h-4')}
          </button>
          <p className="text-[12px] font-semibold text-gray-900">GCO Admin</p>
        </div>
        <div className="flex-1">{views[view]}</div>
      </div>
    </div>
  )
}