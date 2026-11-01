// ============ MAIN ADMIN DASHBOARD - FIXED (WALA NANG DOUBLE HEADER) ============
import { useState } from 'react'
import { logout } from '../../utils/adminAuth'
import { Sidebar, Topbar } from './Layout'
import Overview from './Overview'
import Appointments from './Appointments'
import Submissions from './Submissions'
import Content from './Content'
import Students from './Students'
import { initialAppointments, inventorySubmissions, examResults } from './data'

export default function AdminDashboard({ onLogout }) {
  const [view, setView] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  // ----- COUNTS FOR SIDEBAR BADGE -----
  const counts = {
    appointments: initialAppointments.filter(a => a.status === 'Pending').length,
    submissions: inventorySubmissions.filter(i => i.status === 'Pending Review').length + examResults.filter(e => e.flag === 'urgent').length,
    inventory: inventorySubmissions.filter(i => i.status === 'Pending Review').length,
    assessment: examResults.filter(e => e.flag === 'urgent').length,
  }

  const handleLogout = () => {
    logout()
    onLogout?.()
    window.location.replace('/admin')
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      {/* ----- LEFT SIDEBAR ----- */}
      <Sidebar view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={handleLogout} counts={counts} />

      {/* ----- RIGHT CONTENT AREA ----- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar - mobile menu lang, walang title/subtitle para di dumoble */}
        <Topbar setMobileOpen={setMobileOpen} />

        <div className="flex-1">
          {view === 'overview' && <Overview setView={setView} />}
          {view === 'appointments' && <Appointments />}
          {view === 'submissions' && <Submissions />}
          {view === 'content' && <Content />}
          {view === 'students' && <Students />}
        </div>
      </div>
    </div>
  )
}