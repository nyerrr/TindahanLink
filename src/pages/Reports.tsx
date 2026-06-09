import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types'

type Props = { onNavigate: (page: Page) => void }
type DailySale = { date: string; total: number }
type ItemSale = { name: string; quantity: number }

const COLORS = ['#0D3B2E', '#1B8B5A', '#4ADE80', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Reports({ onNavigate }: Props) {
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [topItems, setTopItems] = useState<ItemSale[]>([])
  const [totalToday, setTotalToday] = useState(0)
  const [totalWeek, setTotalWeek] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: salesData, error } = await supabase
      .from('sales')
      .select('total, quantity, sold_at, item_id, items(name)')
      .gte('sold_at', sevenDaysAgo.toISOString())
      .order('sold_at')

    if (error) return console.error(error)

    setTotalToday(salesData.filter(s => new Date(s.sold_at) >= today).reduce((sum, s) => sum + Number(s.total), 0))
    setTotalWeek(salesData.reduce((sum, s) => sum + Number(s.total), 0))

    const byDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric' })
      byDay[key] = 0
    }
    salesData.forEach(s => {
      const key = new Date(s.sold_at).toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric' })
      if (byDay[key] !== undefined) byDay[key] += Number(s.total)
    })
    setDailySales(Object.entries(byDay).map(([date, total]) => ({ date, total })))

    const byItem: Record<string, number> = {}
    salesData.forEach((s: any) => {
      const name = s.items?.name || 'Unknown'
      byItem[name] = (byItem[name] || 0) + s.quantity
    })
    setTopItems(Object.entries(byItem).map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5))
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center">
        <p className="text-[#0D3B2E]/50 text-sm font-medium">Naglo-load ng ulat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-24">

      <div className="bg-[#0D3B2E] px-5 pt-12 pb-6">
        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Aling Nena's Store</p>
        <h1 className="text-white text-2xl font-bold tracking-tight">Ulat ng Benta</h1>
        <p className="text-white/40 text-xs mt-1">Nakaraang 7 araw</p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl p-3">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Ngayon</p>
            <p className="text-white text-xl font-bold mt-1">₱{totalToday.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl p-3">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">7 Araw</p>
            <p className="text-white text-xl font-bold mt-1">₱{totalWeek.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0D3B2E] h-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F0F4F0] rounded-t-3xl" />
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <p className="text-sm font-bold text-[#0D3B2E] mb-4">Araw-araw na Kita</p>
          {dailySales.every(d => d.total === 0) ? (
            <p className="text-gray-400 text-xs text-center py-6">Wala pang benta ngayong linggo.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailySales} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9CA3AF', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`₱${Number(value)}`, 'Kita']}
                  contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Plus Jakarta Sans' }}
                />
                <Bar dataKey="total" fill="#0D3B2E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E8EDE8] p-4">
          <p className="text-sm font-bold text-[#0D3B2E] mb-4">Pinaka-mabentang Produkto</p>
          {topItems.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-6">Wala pang benta.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={topItems} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {topItems.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value)} pcs`, 'Nabenta']} contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', fontFamily: 'Plus Jakarta Sans' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-3">
                {topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-xs text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0D3B2E]">{item.quantity} pcs</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      <BottomNav current="reports" onNavigate={onNavigate} />
    </div>
  )
}