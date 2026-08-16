const tabs = [
  { id: 'home', label: 'Home', path: '/', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#085041' : '#aaa'} strokeWidth={1.7} className="w-[22px] h-[22px]">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'counseling', label: 'Counseling', path: '/counseling', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#085041' : '#aaa'} strokeWidth={1.7} className="w-[22px] h-[22px]">
      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'modules', label: 'Modules', path: '/modules', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#085041' : '#aaa'} strokeWidth={1.7} className="w-[22px] h-[22px]">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#085041' : '#aaa'} strokeWidth={1.7} className="w-[22px] h-[22px]">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'assessment', label: 'Assessment', path: '/assessment', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#085041' : '#aaa'} strokeWidth={1.7} className="w-[22px] h-[22px]">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
]

export default function BottomNav({ page, navigate }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => {
        const active = page === t.id
        return (
          <button key={t.id} onClick={() => navigate(t.path)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-[3px]">
            {t.icon(active)}
            <span className="text-[9.5px] leading-none"
              style={{ color: active ? '#085041' : '#aaa', fontWeight: active ? 700 : 500 }}>
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}