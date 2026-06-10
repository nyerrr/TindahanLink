import type { Notification } from '../components/NotificationPanel'

type Item = {
  id: string
  name: string
  emoji: string
  stock: number
  low_threshold: number
}

// Build notifications from current app state
// Why not fetch from DB? We already have items in state
// No need for an extra network request
export function buildNotifications(items: Item[]): Notification[] {
  const notifications: Notification[] = []

  // Check each item's stock level
  items.forEach(item => {
    if (item.stock <= 0) {
      // Out of stock — most urgent
      notifications.push({
        id: `out_${item.id}`,
        type: 'out_of_stock',
        title: `${item.name} ay WALA na!`,
        message: `Stock ay ubos na. Mag-restock agad para hindi mawalan ng benta.`,
        emoji: item.emoji,
        urgent: true
      })
    } else if (item.stock <= item.low_threshold) {
      // Low stock — urgent
      notifications.push({
        id: `low_${item.id}`,
        type: 'low_stock',
        title: `Mababa na ang ${item.name}`,
        message: `${item.stock} piraso na lang natitira. I-restock bago pa maubusan.`,
        emoji: item.emoji,
        urgent: true
      })
    }
  })

  // Check payday
  // Why here? Payday is a notification too — not just a weather alert
  const today = new Date()
  const day = today.getDate()
  const daysUntil15 = 15 - day
  const daysUntil30 = 30 - day

  if (daysUntil15 === 1 || daysUntil30 === 1) {
    notifications.push({
      id: 'payday_tomorrow',
      type: 'payday',
      title: 'Payday bukas!',
      message: 'Mag-stock ng mas marami ngayon. Mataas ang benta sa payday.',
      emoji: '💸',
      urgent: false
    })
  } else if (daysUntil15 === 0 || daysUntil30 === 0) {
    notifications.push({
      id: 'payday_today',
      type: 'payday',
      title: 'Payday ngayon!',
      message: 'Maraming bibili ngayon. Siguraduhing may stock ka ng lahat.',
      emoji: '💰',
      urgent: false
    })
  }

  // Sort: urgent first, then non-urgent
  // Why: most important alerts should be at the top
  return notifications.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1
    if (!a.urgent && b.urgent) return 1
    return 0
  })
}