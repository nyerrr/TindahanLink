// Request permission to show notifications
// Why: browsers require explicit user permission
// Returns true if granted, false if denied
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications')
    return false
  }

  // If already granted, return true immediately
  if (Notification.permission === 'granted') return true

  // If denied before, can't ask again
  if (Notification.permission === 'denied') return false

  // Ask the user
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Show a local notification immediately
// Why local? No server needed — browser shows it directly
// Works when app is open OR minimized
// Does NOT work when browser is completely closed
export async function showLocalNotification(
  title: string,
  body: string,
  icon: string = '/icon-192.png'
): Promise<void> {
  const granted = await requestNotificationPermission()
  if (!granted) return

  // Use service worker to show notification
  // Why SW? Regular new Notification() doesn't work on mobile PWAs
  const registration = await navigator.serviceWorker.ready

  await registration.showNotification(title, {
    body,
    icon,
    badge: '/icon-192.png',
    tag: 'tindahanlink', // prevents duplicate notifications
    data: { url: '/' }
    })
}

// Check stock and show notifications for low items
// Called when app loads and after each sale
export async function checkAndNotifyLowStock(items: {
  name: string
  stock: number
  low_threshold: number
  emoji: string
}[]): Promise<void> {
  const granted = await requestNotificationPermission()
  if (!granted) return

  const outOfStock = items.filter(i => i.stock <= 0)
  const lowStock = items.filter(i => i.stock > 0 && i.stock <= i.low_threshold)

  // Show one combined notification for all low stock items
  // Why combined? Multiple notifications would be annoying
  if (outOfStock.length > 0) {
    await showLocalNotification(
      '⚠️ Ubos na ang stock!',
      `${outOfStock.map(i => i.name).join(', ')} ay wala nang stock.`,
    )
  } else if (lowStock.length > 0) {
    await showLocalNotification(
      '📦 Mababa na ang stock',
      `${lowStock.map(i => `${i.emoji} ${i.name} (${i.stock} na lang)`).join(', ')}`,
    )
  }
}