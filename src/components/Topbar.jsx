export default function Topbar({ page, navigate }) {
  const links = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'counseling', label: 'Counseling', path: '/counseling' },
    { id: 'modules', label: 'Modules', path: '/modules' },
    { id: 'inventory', label: 'Inventory', path: '/inventory' },
    { id: 'assessment', label: 'Assessment', path: '/assessment' },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#085041] h-[60px] flex items-center justify-between px-4 gap-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
          CvSU
        </div>
        <div className="min-w-0">
          <p className="text-white text-[12px] font-semibold truncate leading-tight">Guidance &amp; Counseling Office</p>
          <p className="text-white/60 text-[10px]">CvSU Imus Campus</p>
        </div>
      </div>

      {/* PC Nav */}
      <div className="hidden md:flex items-center gap-1">
        {links.map(l => (
          <button key={l.id} onClick={() => navigate(l.path)}
            className={`text-[13px] px-3 py-1.5 rounded-full transition-all ${page === l.id ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            {l.label}
          </button>
        ))}
      </div>

      <button onClick={() => navigate('/counseling')}
        className="bg-white/15 border border-white/25 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
        Book Appointment
      </button>
    </div>
  )
}