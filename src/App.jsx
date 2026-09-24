import { useState, useCallback, createContext, useContext, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Topbar from './components/Topbar'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import Home from './pages/Home'
import Counseling from './pages/Counseling'
import Modules from './pages/Modules'
import Assessment from './pages/Assessment'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import { isLoggedIn } from './utils/adminAuth'

// Toast Context
export const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

function Toast({ message, visible }) {
  return (
    <div className={`fixed top-[80px] left-1/2 -translate-x-1/2 z-[999] bg-gray-900 bg-opacity-90 text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-lg whitespace-nowrap transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
      {message}
    </div>
  )
}

function NotFound({ navigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-5">
      <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={1.8} className="w-8 h-8">
          <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-[20px] font-bold text-gray-900 mb-2">Page Not Found</p>
      <p className="text-[14px] text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')} className="bg-[#085041] text-white px-6 py-3 rounded-full text-[14px] font-semibold">
        Go Home
      </button>
    </div>
  )
}

// Appointment History placeholder (will be built in Step 7)
function AppointmentHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-5">
      <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth={1.8} className="w-8 h-8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1118 2m0 0l2 2m-2-2l-2 2"/>
        </svg>
      </div>
      <p className="text-[20px] font-bold text-gray-900 mb-2">Appointment History</p>
      <p className="text-[14px] text-gray-500">Your booking history will appear here.</p>
    </div>
  )
}

// Student-facing layout: Topbar + BottomNav + OfflineBanner
function StudentLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState({ message: '', visible: false })
  let toastTimer = null

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer)
    setToast({ message: msg, visible: true })
    toastTimer = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }, [])

  const goTo = useCallback((path) => {
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [navigate])

  const pageId = location.pathname === '/' ? 'home' : location.pathname.replace('/', '')

  return (
    <ToastContext.Provider value={showToast}>
      <div className="bg-[#f4f9f7] min-h-screen">
        <OfflineBanner />
        <Topbar page={pageId} navigate={goTo} />
        <Toast message={toast.message} visible={toast.visible} />
        <div className="pt-[60px] pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home navigate={goTo} />} />
            <Route path="/initial-assessment" element={<Assessment showToast={showToast} />} />
            <Route path="/modules" element={<Modules showToast={showToast} />} />
            <Route path="/book-appointment" element={<Counseling showToast={showToast} />} />
            <Route path="/appointment-history" element={<AppointmentHistory />} />
            {/* Redirects for old routes */}
            <Route path="/counseling" element={<Navigate to="/book-appointment" replace />} />
            <Route path="/assessment" element={<Navigate to="/initial-assessment" replace />} />
            <Route path="/inventory" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound navigate={goTo} />} />
          </Routes>
        </div>
        <BottomNav page={pageId} navigate={goTo} />
      </div>
    </ToastContext.Provider>
  )
}

// Gated admin area: shows login form until authenticated
function AdminArea() {
  const [authed, setAuthed] = useState(isLoggedIn())

  useEffect(() => {
    setAuthed(isLoggedIn())
  }, [])

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Admin has its own completely separate layout, no student nav, gated by login */}
        <Route path="/admin/*" element={<AdminArea />} />
        {/* Everything else uses the student layout */}
        <Route path="/*" element={<StudentLayout />} />
      </Routes>
    </ErrorBoundary>
  )
}