import { IconHome, IconCounseling, IconModules, IconInventory, IconAssessment } from './Icons'

const tabs = [
  { id: 'home', label: 'Home', path: '/', Icon: IconHome },
  { id: 'counseling', label: 'Counseling', path: '/counseling', Icon: IconCounseling },
  { id: 'modules', label: 'Modules', path: '/modules', Icon: IconModules },
  { id: 'inventory', label: 'Inventory', path: '/inventory', Icon: IconInventory },
  { id: 'assessment', label: 'Assessment', path: '/assessment', Icon: IconAssessment },
]

export default function BottomNav({ page, navigate }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => {
        const active = page === t.id
        const Icon = t.Icon
        return (
          <button key={t.id} onClick={() => navigate(t.path)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-[3px]">
            <Icon stroke={active ? '#085041' : '#aaa'} className="w-[22px] h-[22px]"/>
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