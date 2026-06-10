import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Page } from '../types'

// What one notification looks like
export type Notification = {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'payday' | 'weather'
  title: string
  message: string
  emoji: string
  urgent: boolean
}

type Props = {
  notifications: Notification[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: Page) => void
}

export default function NotificationPanel({
  notifications,
  isOpen,
  onClose,
  onNavigate
}: Props) {
    // Lock body scroll when panel is open
    // Why useEffect? Because we need to run side effects
    // (touching the DOM directly) in response to state changes
    useEffect(() => {
        if (isOpen) {
        // Prevent background from scrolling
        document.body.style.overflow = 'hidden'
        } else {
        // Restore scrolling when panel closes
        document.body.style.overflow = ''
        }

        // Cleanup function — runs when component unmounts
        // Why? If panel unmounts while open, we must restore scroll
        // Otherwise the whole app gets stuck and can't scroll
        return () => {
        document.body.style.overflow = ''
        }
    }, [isOpen]) // Only re-runs when isOpen changes

  function handleNotificationTap(notif: Notification) {
    // If it's a stock alert, go to inventory
    if (notif.type === 'low_stock' || notif.type === 'out_of_stock') {
      onNavigate('inventory')
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — tapping outside closes the panel */}
          {/* Why: standard UX pattern for dismissing overlays */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel — slides down from the top */}
          {/* Why from top? The bell is at the top so it feels */}
          {/* like the panel is coming from the bell itself */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white rounded-b-3xl shadow-xl shadow-black/10 max-h-[70vh] overflow-hidden flex flex-col"
          >
            {/* Panel Header */}
            <div className="bg-[#0D3B2E] px-5 pt-12 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-white text-lg font-bold">Mga Alerto</h2>
                <p className="text-white/50 text-xs mt-0.5">
                  {notifications.length} bagay ang nangangailangan ng atensyon
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm font-bold text-[#0D3B2E]">Lahat ay ayos!</p>
                  <p className="text-xs text-gray-400 mt-1">Walang alerto ngayon</p>
                </div>
              ) : (
                notifications.map((notif, index) => (
                  <motion.button
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationTap(notif)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl border transition-all active:scale-95 ${
                      notif.urgent
                        ? 'bg-red-50 border-red-100'
                        : 'bg-[#F0F4F0] border-transparent'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{notif.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${
                        notif.urgent ? 'text-red-700' : 'text-[#0D3B2E]'
                      }`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    {notif.urgent && (
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
                    )}
                  </motion.button>
                ))
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}