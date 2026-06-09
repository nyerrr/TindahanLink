import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import WeatherAlert from '../components/WeatherAlert'
import type { Page } from '../types'


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
  const [items, setItems] = useState<Item[]>([])
  const [sales, setSales] = useState(0)
  const [sold, setSold] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Lahat')

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
    setItems(data.map(item => ({
      ...item,
      low: item.stock <= item.low_threshold
    })))
    setLoading(false)
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

  async function handleTap(item: Item) {
    if (item.stock <= 0) return
    await supabase.from('sales').insert({ item_id: item.id, quantity: 1, total: item.price })
    await supabase.from('items').update({ stock: item.stock - 1 }).eq('id', item.id)
    setItems(items => items.map(i =>
      i.id === item.id
        ? { ...i, stock: i.stock - 1, low: i.stock - 1 <= i.low_threshold }
        : i
    ))
    setSales(s => s + item.price)
    setSold(s => s + 1)
  }

  // Filter by search + category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'Lahat' || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

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
      <div className="bg-[#0D3B2E] px-5 pt-12 pb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
              Open for business
            </span>
          </div>
          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-sm">
            🔔
          </button>
        </div>

        <h1 className="text-white text-2xl font-bold tracking-tight">Aling Nena's</h1>
        <p className="text-white/40 text-xs mt-0.5">{today} · Caloocan</p>

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
            onChange={e => setSearch(e.target.value)}
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
              onClick={() => setActiveCategory(cat)}
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
            <span className="text-gray-300 font-medium ml-1.5">
              ({filteredItems.length})
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
          ) : filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTap(item)}
              disabled={item.stock <= 0}
              className={`bg-white rounded-2xl border border-[#E8EDE8] p-3 flex flex-col items-center relative active:scale-95 transition-all ${
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

      </div>

      <BottomNav current="dashboard" onNavigate={onNavigate} />
    </div>
  )
}