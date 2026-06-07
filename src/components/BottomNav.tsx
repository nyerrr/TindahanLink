type Page = 'dashboard' | 'inventory' | 'reports'

type Props = {
  current: Page
  onNavigate: (page: Page) => void
}

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center cursor-pointer ${current === 'dashboard' ? 'text-[#E8301A]' : 'text-gray-400'}`}
      >
        <span className="text-xl">🏠</span>
        <span className="text-[10px] mt-0.5">Dashboard</span>
      </button>
      <button
        onClick={() => onNavigate('reports')}
        className={`flex flex-col items-center cursor-pointer ${current === 'reports' ? 'text-[#E8301A]' : 'text-gray-400'}`}
      >
        <span className="text-xl">📊</span>
        <span className="text-[10px] mt-0.5">Ulat</span>
      </button>
      <button
        onClick={() => onNavigate('inventory')}
        className={`flex flex-col items-center cursor-pointer ${current === 'inventory' ? 'text-[#E8301A]' : 'text-gray-400'}`}
      >
        <span className="text-xl">📦</span>
        <span className="text-[10px] mt-0.5">Imbentaryo</span>
      </button>
      <button 
        onClick={() => onNavigate('inventory')}
        className="flex flex-col items-center text-gray-400">
        <span className="text-xl">⚙️</span>
        <span className="text-[10px] mt-0.5">Settings</span>
      </button>
    </div>
  )
}