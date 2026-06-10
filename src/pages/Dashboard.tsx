import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import WeatherAlert from '../components/WeatherAlert'
import type { Page } from '../types'
import { useProfile } from '../context/ProfileContext'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationPanel from '../components/NotificationPanel'
import { buildNotifications } from '../lib/notifications'
import { checkAndNotifyLowStock } from '../lib/pushNotifications'

type Item = {
  id: string
  emoji: string
  name: string
  stock: number
  price: number
  low_threshold: number
  category: string
  low?: boolean
}

type Props = { onNavigate: (page: Page) => void }

const CATEGORIES = ['Lahat', 'Inumin', 'Pagkain', 'Gamot', 'Hygiene', 'Meryenda', 'Iba pa']

const CATEGORY_EMOJI: Record<string, string> = {
  'Lahat': '🏪',
  'Inumin': '☕',
  'Pagkain': '🍜',
  'Gamot': '💊',
  'Hygiene': '🧴',
  'Meryenda': '🍬',
  'Iba pa': '📦',
}

export default function Dashboard({ onNavigate }: Props) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [sales, setSales] = useState(0)
  const [sold, setSold] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Lahat')
  const [sellingItem, setSellingItem] = useState<Item | null>(null)
  const [sellQty, setSellQty] = useState('1')
  const [sellLoading, setSellLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const { profile } = useProfile()

  useEffect(() => {
    fetchItems()
    fetchTodaySales()
  }, [])

  async function fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name')
    if (error) return console.error(error)

    const mappedItems = data.map(item => ({
      ...item,
      low: item.stock <= item.low_threshold
    }))
    setItems(mappedItems)
    setLoading(false)

    // Check stock levels and notify if needed
    // Why after setItems? So UI updates first, then notification
    await checkAndNotifyLowStock(mappedItems)
  }

  async function fetchTodaySales() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('sales')
      .select('quantity, total')
      .gte('sold_at', today.toISOString())
    if (error) return console.error(error)
    setSales(data.reduce((sum, s) => sum + Number(s.total), 0))
    setSold(data.reduce((sum, s) => sum + s.quantity, 0))
  }

  // Step 1: Open the quantity modal
  function openSellModal(item: Item) {
    if (item.stock <= 0) return
    setSellingItem(item)
    setSellQty('1') // default to 1
  }

  // Step 2: Actually record the sale
  async function confirmSell() {
    if (!sellingItem) return

    const qty = Number(sellQty)

    // Validate quantity
    if (!qty || qty <= 0) return alert('Maglagay ng tamang bilang!')
    if (qty > sellingItem.stock) return alert(`${sellingItem.name} ay ${sellingItem.stock} na lang natitira!`)

    setSellLoading(true)

    const total = qty * sellingItem.price

    // Record the sale with the correct quantity and total
    await supabase.from('sales').insert({
      item_id: sellingItem.id,
      quantity: qty,
      total: total
    })

    // Update stock — subtract the full quantity at once
    await supabase.from('items').update({
      stock: sellingItem.stock - qty
    }).eq('id', sellingItem.id)

    // Update local state immediately — no need to refetch
    const newStock = sellingItem.stock - qty
    const updatedItems = items.map(i =>
      i.id === sellingItem.id
        ? { ...i, stock: newStock, low: newStock <= i.low_threshold }
        : i
    )
    setItems(updatedItems)

    // Notify if stock just went low
    await checkAndNotifyLowStock(updatedItems)

    // Update the sales counters
    setSales(s => s + total)
    setSold(s => s + qty)

    // Close modal
    setSellingItem(null)
    setSellLoading(false)
  }

  // Filter by search + category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'Lahat' || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  // Pagination
  const totalFiltered = filteredItems.length
  const visibleItems = filteredItems.slice(0, visibleCount)
  const hasMore = visibleCount < totalFiltered

  // Notifications
  const notifications = buildNotifications(items)
  const urgentCount = notifications.filter(n => n.urgent).length

  

  // Only show categories that have items
  const usedCategories = CATEGORIES.filter(cat =>
    cat === 'Lahat' || items.some(i => i.category === cat)
  )

  const today = new Date().toLocaleDateString('fil-PH', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-3">🏪</p>
          <p className="text-[#0D3B2E]/50 text-sm font-medium">Naglo-load...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-24">

      {/* Header */}
      <div className="bg-[#0D3B2E] px-5 pt-4 pb-6">
        <div className="border-l-4 border-[#819385] flex p-3 justify-between items-center mb-4 bg-[#2e7b65] rounded-full px-8 pb-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-black text-[11px] font-semibold uppercase tracking-widest">
              Open for business
            </span>
          </div>
          {/* Bell button with badge */}
          {/* Why relative + absolute? To position the badge on top of the button */}
          <button
            onClick={() => setNotifOpen(true)}
            className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-sm"
          >
            🔔
            {urgentCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-[8px] font-bold">{urgentCount}</span>
              </motion.div>
            )}
          </button>
        </div>

        <h1 className="text-white text-2xl font-bold tracking-tight">{profile.store_name}</h1>
        <p className="text-white/40 text-xs mt-0.5">{today} · {profile.location}</p> 

        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl p-3">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Kita ngayon</p>
            <p className="text-white text-2xl font-bold tracking-tight mt-1">
              ₱{sales.toLocaleString()}
            </p>
          </div>
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl p-3">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Nabenta</p>
            <p className="text-white text-2xl font-bold tracking-tight mt-1">{sold}</p>
            <p className="text-white/30 text-[10px] mt-0.5">items ngayong araw</p>
          </div>
        </div>
      </div>

      {/* Curve */}
      <div className="bg-[#0D3B2E] h-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F0F4F0] rounded-t-3xl" />
      </div>

      <div className="px-4">

        <WeatherAlert />

        {/* Low stock warning */}
        {items.some(i => i.low) && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-2xl p-3">
            <p className="text-red-700 text-xs font-semibold">
              ⚠️ Mababang stock: {items.filter(i => i.low).map(i => i.name).join(', ')}
            </p>
          </div>
        )}

        {/* Search bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={search}
            onChange={e => {
            setSearch(e.target.value)
            setVisibleCount(6)
          }}
            placeholder="Hanapin ang produkto..."
            className="w-full bg-white border border-[#E8EDE8] rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-[#0D3B2E] placeholder:text-gray-300 focus:outline-none focus:border-[#0D3B2E] transition-colors"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-base">
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {usedCategories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat)
                setVisibleCount(6)
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#0D3B2E] text-white'
                  : 'bg-white text-gray-400 border border-[#E8EDE8]'
              }`}
            >
              <span>{CATEGORY_EMOJI[cat]}</span>
              <span>{cat}</span>
              {cat !== 'Lahat' && (
                <span className={`text-[9px] px-1 rounded-full ${
                  activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {items.filter(i => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="flex justify-between items-center mt-4 mb-3">
          <p className="text-[#0D3B2E] text-sm font-bold tracking-tight">
            {activeCategory === 'Lahat' ? 'Lahat ng Produkto' : activeCategory}
            <span className="text-gray-600 font-medium ml-1.5">
              ({visibleCount < totalFiltered ? `${visibleCount} sa ${totalFiltered}` : totalFiltered})
            </span>
          </p>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-[#1B8B5A] text-xs font-semibold"
          >
            I-manage →
          </button>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-3 gap-2">
          {filteredItems.length === 0 ? (
            <div className="col-span-3 py-10 text-center">
              <p className="text-3xl mb-2">
                {search ? '🔍' : CATEGORY_EMOJI[activeCategory]}
              </p>
              <p className="text-sm font-medium text-gray-400">
                {search
                  ? `Walang nahanap na "${search}"`
                  : `Walang items sa ${activeCategory}`
                }
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('Lahat') }}
                className="text-xs text-[#1B8B5A] font-semibold mt-2"
              >
                Tingnan lahat
              </button>
            </div>
          ) : visibleItems.map(item => (
            <button
              key={item.id}
              onClick={() => openSellModal(item)}
              disabled={item.stock <= 0}
              className={`cursor-pointer bg-white rounded-2xl border border-[#E8EDE8] p-3 flex flex-col items-center relative active:scale-95 transition-all ${
                item.stock <= 0 ? 'opacity-40' : ''
              }`}
            >
              <span className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                item.stock <= 0
                  ? 'bg-gray-100 text-gray-400'
                  : item.low
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {item.stock <= 0 ? 'WALA' : item.low ? 'MABABA' : 'OK'}
              </span>
              <span className="text-2xl mt-2">{item.emoji}</span>
              <span className="text-[10px] font-bold text-[#0D3B2E] text-center mt-2 leading-tight">
                {item.name}
              </span>
              <span className="text-[10px] text-[#1B8B5A] font-bold mt-1">₱{item.price}</span>
              <span className="text-[9px] text-gray-400 mt-0.5">{item.stock} natitira</span>
            </button>
          ))}
        </div>

        {/* Show more button */}
        <AnimatePresence>
          {hasMore && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setVisibleCount(c => c + 6)}
              className="cursor-pointer w-full mt-3 bg-white border border-[#E8EDE8] rounded-2xl py-3.5 text-sm font-bold text-[#0D3B2E] active:scale-95 transition-transform"
            >
              Tingnan pa ({totalFiltered - visibleCount} pa)
            </motion.button>
          )}
        </AnimatePresence>

        {!hasMore && totalFiltered > 6 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-black font-medium mt-3 pb-2"
          >
            Lahat ng {totalFiltered} produkto ay nakita na ✅
          </motion.p>
        )}

      </div>
      {/* Sell Quantity Modal */}
      <AnimatePresence>
        {sellingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end z-50"
            onClick={() => setSellingItem(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white w-full rounded-t-3xl p-6 pb-10"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              {/* Item info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-[#F0F4F0] rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  {sellingItem.emoji}
                </div>
                <div>
                  <p className="font-bold text-[#0D3B2E]">{sellingItem.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ₱{sellingItem.price} bawat isa · {sellingItem.stock} natitira
                  </p>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mb-2">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3 block">
                  Ilang piraso ang nabenta?
                </label>

                {/* + and - buttons with input in the middle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSellQty(q => String(Math.max(1, Number(q) - 1)))}
                    className="w-12 h-12 flex items-center justify-center text-xl font-bold text-[#0D3B2E] active:scale-95 transition-transform"
                  >
                    −
                  </button>
                  <input
                    inputMode="numeric"
                    value={sellQty}
                    onChange={e => setSellQty(e.target.value)}
                    className="flex-1 text-center text-2xl font-bold text-[#0D3B2E] bg-[#F0F4F0] rounded-2xl py-3 focus:outline-none focus:border-[#0D3B2E] border border-transparent"
                  />
                  <button
                    onClick={() => setSellQty(q => String(Math.min(sellingItem.stock, Number(q) + 1)))}
                    className="w-12 h-12  flex items-center justify-center text-xl font-bold text-[#0D3B2E] active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total preview */}
              {/* Why show this? So Aling Nena can verify before confirming */}
              <div className="p-3 mb-5 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Kabuuang halaga</span>
                <span className="text-lg font-bold text-[#0D3B2E]">
                  ₱{(Number(sellQty) * sellingItem.price).toLocaleString()}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSellingItem(null)}
                  className="flex-1 bg-[#F0F4F0] rounded-2xl py-3.5 text-sm font-semibold text-gray-500"
                >
                  Kanselahin
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmSell}
                  disabled={sellLoading}
                  className="flex-1 bg-[#0D3B2E] text-white rounded-2xl py-3.5 text-sm font-bold disabled:opacity-60"
                >
                  {sellLoading ? 'Nagse-save...' : 'I-record ang Benta ✓'}
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav current="dashboard" onNavigate={onNavigate} />
      <NotificationPanel
        notifications={notifications}
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  )
}