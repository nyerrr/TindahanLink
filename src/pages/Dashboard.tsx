import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import WeatherAlert from '../components/WeatherAlert'

type Item = {
  id: string
  emoji: string
  name: string
  stock: number
  price: number
  low_threshold: number
  low?: boolean
}

type Page = 'dashboard' | 'inventory' | 'reports'

type Props = {
  onNavigate: (page: Page) => void
}

export default function Dashboard({ onNavigate }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [sales, setSales] = useState(0)
  const [sold, setSold] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch items from Supabase
  useEffect(() => {
    fetchItems()
    fetchTodaySales()
  }, [])

  async function fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching items:', error)
      return
    }

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

    if (error) {
      console.error('Error fetching sales:', error)
      return
    }

    const totalSales = data.reduce((sum, s) => sum + Number(s.total), 0)
    const totalSold = data.reduce((sum, s) => sum + s.quantity, 0)
    setSales(totalSales)
    setSold(totalSold)
  }

  async function handleTap(item: Item) {
    if (item.stock <= 0) return

    // Record the sale
    const { error: saleError } = await supabase
      .from('sales')
      .insert({
        item_id: item.id,
        quantity: 1,
        total: item.price
      })

    if (saleError) {
      console.error('Error recording sale:', saleError)
      return
    }

    // Update stock
    const { error: stockError } = await supabase
      .from('items')
      .update({ stock: item.stock - 1 })
      .eq('id', item.id)

    if (stockError) {
      console.error('Error updating stock:', stockError)
      return
    }

    // Update local state immediately (no need to refetch)
    setItems(items => items.map(i =>
      i.id === item.id
        ? { ...i, stock: i.stock - 1, low: i.stock - 1 <= i.low_threshold }
        : i
    ))
    setSales(s => s + item.price)
    setSold(s => s + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-gray-500 text-sm">Naglo-load...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">

      {/* Header */}
      <div className="bg-[#E8301A] px-5 pt-10 pb-5">
        <p className="text-white text-xl font-semibold">TindahanLink 🏪</p>
        <p className="text-white/70 text-sm mt-1">Aling Nena's Store · Caloocan</p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/20 rounded-xl p-3">
            <p className="text-white/70 text-xs">Kita ngayon</p>
            <p className="text-white text-2xl font-semibold">₱{sales.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl p-3">
            <p className="text-white/70 text-xs">Nabenta</p>
            <p className="text-white text-2xl font-semibold">{sold} items</p>
          </div>
        </div>
      </div>

      {/* Alert */}
      <WeatherAlert />

      {/* Low stock warning */}
      {items.some(i => i.low) && (
        <div className="mx-4 mt-2 bg-red-50 border-l-4 border-[#E8301A] rounded-xl p-3">
          <p className="text-red-700 text-sm font-medium">
            ⚠️ Mababang stock: {items.filter(i => i.low).map(i => i.name).join(', ')}
          </p>
        </div>
      )}

      {/* Grid Label */}
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest px-4 pt-5 pb-2">
        Mabilis na Tap – I-record ang Benta
      </p>

      {/* Item Grid */}
      <div className="grid grid-cols-3 gap-2 px-4">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => handleTap(item)}
            disabled={item.stock <= 0}
            className={`bg-white rounded-2xl p-3 flex flex-col items-center relative active:scale-95 transition-transform shadow-sm ${item.stock <= 0 ? 'opacity-40' : ''}`}
          >
            <span className={`absolute top-2 right-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.low ? 'bg-[#E8301A]' : 'bg-[#3B6D11]'}`}>
              {item.stock <= 0 ? 'WALA' : item.low ? 'LOW' : 'OK'}
            </span>
            <span className="text-3xl mt-2">{item.emoji}</span>
            <span className="text-xs font-medium text-center mt-2 leading-tight">{item.name}</span>
            <span className="text-[10px] text-gray-400 mt-1">Stock: {item.stock} pcs</span>
            <span className="text-[10px] text-[#E8301A] font-medium">₱{item.price}</span>
          </button>
        ))}
      </div>
      <BottomNav current="dashboard" onNavigate={onNavigate} />
    </div>
  )
}