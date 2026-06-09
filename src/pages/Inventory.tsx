import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
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

type Props = {
  onNavigate: (page: Page) => void
}

type FormData = {
  emoji: string
  name: string
  stock: string | number
  price: string | number
  low_threshold: string | number
  category: string
}

const EMPTY_FORM = { emoji: '📦', name: '', stock: '', price: '', low_threshold: '', category: 'Iba pa' }

export default function Inventory({ onNavigate }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    const { data, error } = await supabase.from('items').select('*').order('name')
    if (error) return console.error(error)
    setItems(data)
    setLoading(false)
  }

  function openAdd() { setEditItem(null); setForm(EMPTY_FORM); setShowForm(true) }
  function openEdit(item: Item) {
    setEditItem(item)
    setForm({
      emoji: item.emoji,
      name: item.name,
      stock: String(item.stock),
      price: String(item.price),
      low_threshold: String(item.low_threshold),
      category: item.category
    })
    setShowForm(true)
  }
  async function handleSave() {
    if (!form.name.trim()) return alert('Lagyan ng pangalan ang item!')
    setSaving(true)

    const payload = {
      emoji: form.emoji,
      name: form.name,
      stock: Number(form.stock) || 0,
      price: Number(form.price) || 0,
      low_threshold: Number(form.low_threshold) || 0,
      category: form.category
    }

    if (editItem) {
      await supabase.from('items').update(payload).eq('id', editItem.id)
    } else {
      await supabase.from('items').insert(payload)
    }

    await fetchItems()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(item: Item) {
    if (!window.confirm(`I-delete ang ${item.name}?`)) return
    await supabase.from('items').delete().eq('id', item.id)
    await fetchItems()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center">
        <p className="text-[#0D3B2E]/50 text-sm font-medium">Naglo-load...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-24">

      {/* Header */}
      <div className="bg-[#0D3B2E] px-5 pt-12 pb-6">
        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">
          Aling Nena's Store
        </p>
        <h1 className="text-white text-2xl font-bold tracking-tight">Imbentaryo</h1>
        <p className="text-white/40 text-xs mt-1">{items.length} produkto</p>
      </div>

      <div className="bg-[#0D3B2E] h-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F0F4F0] rounded-t-3xl" />
      </div>

      <div className="px-4 pt-4">
        <button
          onClick={openAdd}
          className="w-full bg-[#0D3B2E] text-white rounded-2xl py-3.5 font-bold text-sm tracking-tight active:scale-95 transition-transform mb-4"
        >
          + Magdagdag ng Bagong Item
        </button>

        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#E8EDE8] p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F0F4F0] rounded-xl flex items-center justify-center text-2xl shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#0D3B2E] truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.stock} pcs · ₱{item.price} · Low sa {item.low_threshold}
                </p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                  item.stock <= 0
                    ? 'bg-gray-100 text-gray-400'
                    : item.stock <= item.low_threshold
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {item.stock <= 0 ? 'WALA' : item.stock <= item.low_threshold ? 'MABABA' : 'OK'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="text-[10px] font-semibold bg-[#F0F4F0] text-[#0D3B2E] px-3 py-1.5 rounded-lg"
                >
                  I-edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-[10px] font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg"
                >
                  Burahin
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="text-lg font-bold text-[#0D3B2E] mb-5">
              {editItem ? 'I-edit ang Item' : 'Bagong Item'}
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="w-16">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Emoji</label>
                  <input
                    value={form.emoji}
                    onChange={e => setForm({ ...form, emoji: e.target.value })}
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-2.5 text-center text-xl focus:outline-none focus:border-[#0D3B2E]"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Pangalan</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="hal. Milo Sachet"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#0D3B2E]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Stock</label>
                  <input
                    inputMode="numeric"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Presyo</label>
                  <input
                    inputMode="decimal"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Alert kapag</label>
                  <input
                    inputMode="numeric"
                    value={form.low_threshold}
                    onChange={e => setForm({ ...form, low_threshold: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Category picker */}
              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                  Kategorya
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Inumin', 'Pagkain', 'Gamot', 'Hygiene', 'Meryenda', 'Iba pa'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        form.category === cat
                          ? 'bg-[#0D3B2E] text-white border-[#0D3B2E]'
                          : 'bg-[#F0F4F0] text-gray-400 border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-100 bg-[#F0F4F0] rounded-xl py-3 text-sm font-semibold text-gray-500">
                Kanselahin
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#0D3B2E] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-60">
                {saving ? 'Sine-save...' : 'I-save'}
              </button>
            </div>
          </div>
        </div>
      )}

      

      <BottomNav current="inventory" onNavigate={onNavigate} />
    </div>
  )
}