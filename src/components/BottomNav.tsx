import type { Page } from '../types'

type Props = {
  current: Page
  onNavigate: (page: Page) => void
}

export default function BottomNav({ current, onNavigate }: Props) {
  const items = [
    { page: 'dashboard' as Page, icon: '🏠', label: 'Dashboard' },
    { page: 'utang' as Page, icon: '📝', label: 'Utang' },
    { page: 'inventory' as Page, icon: '📦', label: 'Imbentaryo' },
    { page: 'reports' as Page, icon: '📊', label: 'Ulat' },
    { page: 'settings' as Page, icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EDE8] flex justify-around py-2 pb-4">
      {items.map(item => (
        <button
          key={item.page}
          onClick={() => onNavigate(item.page)}
          className="flex flex-col items-center gap-1 min-w-12.5"
        >
          <span className="text-xl">{item.icon}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${
            current === item.page ? 'text-[#0D3B2E]' : 'text-gray-300'
          }`}>
            {item.label}
          </span>
          {current === item.page && (
            <div className="w-1 h-1 rounded-full bg-[#1B8B5A]" />
          )}
        </button>
      ))}
    </div>
  )
}