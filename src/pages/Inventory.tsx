import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

type Item = {
  id: string
  emoji: string
  name: string
  stock: number
  price: number
  low_threshold: number
}

type Page = 'dashboard' | 'inventory' | 'reports'

type Props = {
  onNavigate: (page: Page) => void
}


const EMPTY_FORM = { emoji: '📦', name: '', stock: 0, price: 0, low_threshold: 5 }

export default function Inventory({ onNavigate }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name')
    if (error) return console.error(error)
    setItems(data)
    setLoading(false)
  }

  function openAdd() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(item: Item) {
    setEditItem(item)
    setForm({
      emoji: item.emoji,
      name: item.name,
      stock: item.stock,
      price: item.price,
      low_threshold: item.low_threshold
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return alert('Lagyan ng pangalan ang item!')
    setSaving(true)

    if (editItem) {
      // Update existing
      const { error } = await supabase
        .from('items')
        .update(form)
        .eq('id', editItem.id)
      if (error) return console.error(error)
    } else {
      // Add new
      const { error } = await supabase
        .from('items')
        .insert(form)
      if (error) return console.error(error)
    }

    await fetchItems()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(item: Item) {
    const confirm = window.confirm(`I-delete ang ${item.name}?`)
    if (!confirm) return

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id)
    if (error) return console.error(error)
    await fetchItems()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500 text-sm">Naglo-load...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">

      {/* Header */}
      <div className="bg-[#E8301A] px-5 pt-10 pb-5">
        <p className="text-white text-xl font-semibold">Imbentaryo 📦</p>
        <p className="text-white/70 text-sm mt-1">{items.length} na produkto</p>
      </div>

      {/* Add Button */}
      <div className="px-4 pt-4">
        <button
          onClick={openAdd}
          className="w-full bg-[#E8301A] text-white rounded-xl py-3 font-medium text-sm active:scale-95 transition-transform"
        >
          ➕ Magdagdag ng Bagong Item
        </button>
      </div>

      {/* Items List */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Stock: {item.stock} pcs · ₱{item.price} · Low at {item.low_threshold}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white mt-1 inline-block ${item.stock <= item.low_threshold ? 'bg-[#E8301A]' : 'bg-[#3B6D11]'}`}>
                {item.stock <= 0 ? 'WALA' : item.stock <= item.low_threshold ? 'LOW' : 'OK'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => openEdit(item)}
                className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editItem ? '✏️ I-edit ang Item' : '➕ Bagong Item'}
            </h2>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="w-20">
                  <label className="text-xs text-gray-400">Emoji</label>
                  <input
                    value={form.emoji}
                    onChange={e => setForm({ ...form, emoji: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2 text-center text-2xl mt-1"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Pangalan ng Produkto</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="hal. Milo Sachet"
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Stock (bilang)</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Presyo (₱)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Low alert at</label>
                  <input
                    type="number"
                    value={form.low_threshold}
                    onChange={e => setForm({ ...form, low_threshold: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-500"
              >
                Kanselahin
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#E8301A] text-white rounded-xl py-3 text-sm font-medium"
              >
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