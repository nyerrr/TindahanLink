import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import BottomNav from '../components/BottomNav'

type Page = 'dashboard' | 'inventory' | 'reports'

type Props = {
  onNavigate: (page: Page) => void
}

type DailySale = {
  date: string
  total: number
}

type ItemSale = {
  name: string
  quantity: number
}

const COLORS = ['#E8301A', '#3B6D11', '#E8A500', '#1A6DE8', '#9B1AE8', '#E8611A']

export default function Reports({ onNavigate }: Props) {
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [topItems, setTopItems] = useState<ItemSale[]>([])
  const [totalToday, setTotalToday] = useState(0)
  const [totalWeek, setTotalWeek] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    // Last 7 days range
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch all sales from last 7 days
    const { data: salesData, error } = await supabase
      .from('sales')
      .select('total, quantity, sold_at, item_id, items(name)')
      .gte('sold_at', sevenDaysAgo.toISOString())
      .order('sold_at')

    if (error) return console.error(error)

    // Today's total
    const todayTotal = salesData
      .filter(s => new Date(s.sold_at) >= today)
      .reduce((sum, s) => sum + Number(s.total), 0)
    setTotalToday(todayTotal)

    // Week total
    const weekTotal = salesData.reduce((sum, s) => sum + Number(s.total), 0)
    setTotalWeek(weekTotal)

    // Group by day
    const byDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })
      byDay[key] = 0
    }
    salesData.forEach(s => {
      const key = new Date(s.sold_at).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })
      if (byDay[key] !== undefined) byDay[key] += Number(s.total)
    })
    setDailySales(Object.entries(byDay).map(([date, total]) => ({ date, total })))

    // Group by item
    const byItem: Record<string, number> = {}
    salesData.forEach((s: any) => {
      const name = s.items?.name || 'Unknown'
      byItem[name] = (byItem[name] || 0) + s.quantity
    })
    const sorted = Object.entries(byItem)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
    setTopItems(sorted)

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 text-sm">Naglo-load ng ulat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-24">

      {/* Header */}
      <div className="bg-[#E8301A] px-5 pt-10 pb-5">
        <p className="text-white text-xl font-semibold">Ulat ng Benta 📊</p>
        <p className="text-white/70 text-sm mt-1">Nakaraang 7 araw</p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/20 rounded-xl p-3">
            <p className="text-white/70 text-xs">Kita ngayon</p>
            <p className="text-white text-2xl font-semibold">₱{totalToday.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl p-3">
            <p className="text-white/70 text-xs">Kita ngayong linggo</p>
            <p className="text-white text-2xl font-semibold">₱{totalWeek.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Daily Sales Bar Chart */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold mb-3">💰 Araw-araw na Kita</p>
        {dailySales.every(d => d.total === 0) ? (
          <p className="text-gray-400 text-xs text-center py-6">Wala pang benta ngayong linggo.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailySales} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip
                formatter={(value) => [`₱${Number(value)}`, 'Kita']}
                labelStyle={{ fontSize: 11 }}
                contentStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="total" fill="#E8301A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Items Pie Chart */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold mb-3">🏆 Pinaka-mabentang Produkto</p>
        {topItems.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-6">Wala pang benta.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={topItems}
                  dataKey="quantity"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  labelLine={false}
                >
                  {topItems.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value)} pcs`, 'Nabenta']} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-col gap-1.5 mt-2">
              {topItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index] }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium">{item.quantity} pcs</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav current="reports" onNavigate={onNavigate} />
    </div>
  )
}