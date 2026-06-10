import type { Page } from '../types'

type Props = {
  current: Page
  onNavigate: (page: Page) => void
}

// Custom home SVG icon
// Why a component? So we can pass className for color control
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10.5L12.8825 2.82207C12.6355 2.61407 12.3229 2.5 12 2.5C11.6771 2.5 11.3645 2.61407 11.1175 2.82207L2 10.5" />
      <path d="M20.5 9.5V16C20.5 18.3456 20.5 19.5184 19.8801 20.3263C19.7205 20.5343 19.5343 20.7205 19.3263 20.8801C18.5184 21.5 17.3456 21.5 15 21.5V17C15 15.5858 15 14.8787 14.5607 14.4393C14.1213 14 13.4142 14 12 14C10.5858 14 9.87868 14 9.43934 14.4393C9 14.8787 9 15.5858 9 17V21.5C6.65442 21.5 5.48164 21.5 4.67372 20.8801C4.46572 20.7205 4.27954 20.5343 4.11994 20.3263C3.5 19.5184 3.5 18.3456 3.5 16V9.5" />
    </svg>
  )
}

function UtangIcon({ className}: {className?: string }) {
  return(
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    color="currentColor" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.5" 
    stroke-linecap="round"
    stroke-linejoin="round"
    className={className}  
    >
    
    <path d="M14.4862 22H13.0005V20.5142C13.0005 20.0427 13.1878 19.5905 13.5211 19.2571L18.388 14.3905C18.9087 13.8698 19.7528 13.8698 20.2734 14.3905L20.61 14.7271C21.1306 15.2478 21.1306 16.092 20.61 16.6127L15.7431 21.4793C15.4098 21.8127 14.9576 22 14.4862 22Z"></path>
    <path d="M19.0005 10V9C19.0005 5.70017 19.0005 4.05025 17.9754 3.02513C16.9502 2 15.3003 2 12.0005 2H10.0005C6.70066 2 5.05074 2 4.02561 3.02513C3.00049 4.05025 3.00049 5.70017 3.00049 9V16C3.00049 18.3389 3.00049 19.5083 3.53695 20.3621C3.8167 20.8073 4.19316 21.1838 4.63838 21.4635C5.49216 22 6.6616 22 9.00049 22"></path>
    <path d="M11.0005 6H15.0005"></path>
    <path d="M7.00049 10H15.0005"></path>
    <path d="M7.00049 14H13.0005"></path>
  </svg>
  )
}

function InventoryIcon({ className }: {className?: string}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" width="24" 
    height="24" color="currentColor" 
    fill="none" stroke="currentColor" 
    stroke-width="1.5"
    stroke-linecap="round" 
    stroke-linejoin="round"
    className={className}
    >

    <path d="M21 13.6376V10.3624C21 8.71559 21 7.89217 20.6166 7.20744C20.2332 6.52271 19.5317 6.09334 18.1287 5.2346L15.1287 3.39836C13.6056 2.46612 12.8441 2 12 2C11.1559 2 10.3944 2.46612 8.8713 3.39836L5.8713 5.2346C4.46832 6.09334 3.76683 6.52271 3.38341 7.20744C3 7.89217 3 8.71559 3 10.3624V13.6376C3 15.2844 3 16.1078 3.38341 16.7926C3.76683 17.4773 4.46832 17.9067 5.8713 18.7654L8.8713 20.6016C10.3944 21.5339 11.1559 22 12 22C12.8441 22 13.6056 21.5339 15.1287 20.6016L18.1287 18.7654C19.5317 17.9067 20.2332 17.4773 20.6166 16.7926C21 16.1078 21 15.2844 21 13.6376Z"></path>
    <path d="M3.5 7L12 12L20.5 7"></path>
    <path d="M12 12V22"></path>
</svg>
  )
}

function UlatIcon({ className }: {className?: string}) {
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    color="currentColor" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.5"
    className = {className}
    >
    <path d="M6.5 17.5L6.5 14.5M11.5 17.5L11.5 8.5M16.5 17.5V13.5" stroke-linecap="round"></path>
    <path d="M21.5 5.5C21.5 7.15685 20.1569 8.5 18.5 8.5C16.8431 8.5 15.5 7.15685 15.5 5.5C15.5 3.84315 16.8431 2.5 18.5 2.5C20.1569 2.5 21.5 3.84315 21.5 5.5Z"></path>
    <path d="M21.4955 11C21.4955 11 21.5 11.3395 21.5 12C21.5 16.4784 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4784 2.5 12C2.5 7.52169 2.5 5.28252 3.89124 3.89127C5.28249 2.50003 7.52166 2.50003 12 2.50003L13 2.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  )
}

function SettingsIcon({ className }: {className?: string}) {
  return(
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    color="currentColor" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.5"
    className={className}
    >

    <path d="M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z" stroke-linecap="round"></path>
    <path d="M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z"></path>
    </svg>
  )
}

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EDE8] flex justify-around py-2 pb-4">

      {/* Dashboard */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex flex-col items-center gap-1 min-w-12.5"
      >
        <HomeIcon className={current === 'dashboard' ? 'text-[#0D3B2E]' : 'text-gray-300'} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${
          current === 'dashboard' ? 'text-[#0D3B2E]' : 'text-gray-300'
        }`}>
          Dashboard
        </span>
        {current === 'dashboard' && (
          <div className="w-1 h-1 rounded-full bg-[#1B8B5A]" />
        )}
      </button>

      {/* Utang */}
      <button
        onClick={() => onNavigate('utang')}
        className="flex flex-col items-center gap-1 min-w-12.5"
      >
        <UtangIcon className={current === 'utang' ? 'text-[#0D3B2E]' : 'text-gray-300'} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${
          current === 'utang' ? 'text-[#0D3B2E]' : 'text-gray-300'
        }`}>
          Utang
        </span>
        {current === 'utang' && (
          <div className="w-1 h-1 rounded-full bg-[#1B8B5A]" />
        )}
      </button>

      {/* Inventory */}
      <button
        onClick={() => onNavigate('inventory')}
        className="flex flex-col items-center gap-1 min-w-12.5"
      >
        <InventoryIcon className={current === 'inventory' ? 'text-[#0D3B2E]' : 'text-gray-300'} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${
          current === 'inventory' ? 'text-[#0D3B2E]' : 'text-gray-300'
        }`}>
          Imbentaryo
        </span>
        {current === 'inventory' && (
          <div className="w-1 h-1 rounded-full bg-[#1B8B5A]" />
        )}
      </button>

      {/* Reports */}
      <button
        onClick={() => onNavigate('reports')}
        className="flex flex-col items-center gap-1 min-w-12.5"
      >
        <UlatIcon className={current === 'reports' ? 'text-[#0D3B2E]' : 'text-gray-300'} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${
          current === 'reports' ? 'text-[#0D3B2E]' : 'text-gray-300'
        }`}>
          Ulat
        </span>
        {current === 'reports' && (
          <div className="w-1 h-1 rounded-full bg-[#1B8B5A]" />
        )}
      </button>

      {/* Settings */}
      <button
        onClick={() => onNavigate('settings')}
        className="flex flex-col items-center gap-1 min-w-12.5"
      >
        <SettingsIcon className={current === 'settings' ? 'text-[#0D3B2E]' : 'text-gray-300'} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${
          current === 'settings' ? 'text-[#0D3B2E]' : 'text-gray-300'
        }`}>
          Settings
        </span>
        {current === 'settings' && (
          <div className="w-1 h-1 rounded-full bg-[#1B8B5A]" />
        )}
      </button>

    </div>
  )
}