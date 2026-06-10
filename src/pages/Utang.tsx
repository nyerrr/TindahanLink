import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getCustomers, getCustomerUtang, addCustomer,
  addUtang, markAsPaid, deleteCustomer
} from '../lib/utang'
import type { Customer, Utang } from '../lib/utang'
import { useProfile } from '../context/ProfileContext'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types'

type Props = {
  onNavigate: (page: Page) => void
}

export default function UtangPage({ onNavigate }: Props) {
  const { profile } = useProfile()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerUtang, setCustomerUtang] = useState<Utang[]>([])
  const [loadingUtang, setLoadingUtang] = useState(false)

  // Add customer form
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [savingCustomer, setSavingCustomer] = useState(false)

  // Add utang form
  const [showAddUtang, setShowAddUtang] = useState(false)
  const [utangAmount, setUtangAmount] = useState('')
  const [utangItem, setUtangItem] = useState('')
  const [savingUtang, setSavingUtang] = useState(false)

  useEffect(() => { fetchCustomers() }, [])

  async function fetchCustomers() {
    setLoading(true)
    const data = await getCustomers()
    setCustomers(data)
    setLoading(false)
  }

  async function handleSelectCustomer(customer: Customer) {
    setSelectedCustomer(customer)
    setLoadingUtang(true)
    const data = await getCustomerUtang(customer.id)
    setCustomerUtang(data)
    setLoadingUtang(false)
  }

  async function handleAddCustomer() {
    if (!newName.trim()) return alert('Lagyan ng pangalan!')
    setSavingCustomer(true)
    await addCustomer(newName.trim(), newPhone.trim())
    await fetchCustomers()
    setNewName('')
    setNewPhone('')
    setShowAddCustomer(false)
    setSavingCustomer(false)
  }

  async function handleAddUtang() {
    if (!utangAmount || !selectedCustomer) return
    if (Number(utangAmount) <= 0) return alert('Maglagay ng tamang halaga!')
    setSavingUtang(true)
    await addUtang(selectedCustomer.id, Number(utangAmount), utangItem)
    // Refresh both the customer list and detail view
    await fetchCustomers()
    const updated = await getCustomerUtang(selectedCustomer.id)
    setCustomerUtang(updated)
    // Update selected customer's total
    const updatedCustomers = await getCustomers()
    const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer.id)
    if (updatedCustomer) setSelectedCustomer(updatedCustomer)
    setUtangAmount('')
    setUtangItem('')
    setShowAddUtang(false)
    setSavingUtang(false)
  }

  async function handleMarkPaid(utangId: string) {
    await markAsPaid(utangId)
    if (selectedCustomer) {
      const updated = await getCustomerUtang(selectedCustomer.id)
      setCustomerUtang(updated)
      await fetchCustomers()
      const updatedCustomers = await getCustomers()
      const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer.id)
      if (updatedCustomer) setSelectedCustomer(updatedCustomer)
    }
  }

  async function handleDeleteCustomer(customer: Customer) {
    if (!window.confirm(`I-delete si ${customer.name} at lahat ng kanyang utang?`)) return
    await deleteCustomer(customer.id)
    await fetchCustomers()
    setSelectedCustomer(null)
  }

  const totalUtang = customers.reduce((sum, c) => sum + (c.total_utang || 0), 0)

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
          {profile.store_name}
        </p>
        <h1 className="text-white text-2xl font-bold tracking-tight">Listahan ng Utang</h1>
        <p className="text-white/40 text-xs mt-1">{customers.length} customers</p>

        {/* Total utang summary */}
        <div className="mt-4 bg-white/10 border border-white/10 rounded-2xl p-3">
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
            Kabuuang Utang
          </p>
          <p className="text-white text-2xl font-bold tracking-tight mt-1">
            ₱{totalUtang.toLocaleString()}
          </p>
          <p className="text-white/30 text-[10px] mt-0.5">
            mula sa {customers.filter(c => (c.total_utang || 0) > 0).length} customers
          </p>
        </div>
      </div>

      <div className="bg-[#0D3B2E] h-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F0F4F0] rounded-t-3xl" />
      </div>

      <div className="px-4 pt-4">

        {/* Add Customer Button */}
        <button
          onClick={() => setShowAddCustomer(true)}
          className="w-full bg-[#0D3B2E] text-white rounded-2xl py-3.5 font-bold text-sm tracking-tight active:scale-95 transition-transform mb-4"
        >
          + Magdagdag ng Customer
        </button>

        {/* Customer List */}
        {customers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm font-bold text-[#0D3B2E]">Wala pang customers</p>
            <p className="text-xs text-gray-400 mt-1">I-tap ang button sa taas para magdagdag</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {customers.map(customer => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#E8EDE8] p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition-all"
                onClick={() => handleSelectCustomer(customer)}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-[#0D3B2E] rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-white text-lg font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#0D3B2E] truncate">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {customer.utang_count} utang na hindi pa nabayaran
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${
                    (customer.total_utang || 0) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ₱{(customer.total_utang || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {(customer.total_utang || 0) > 0 ? 'may utang' : 'bayad na'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-[#F0F4F0] z-40 flex flex-col"
          >
            {/* Detail Header */}
            <div className="bg-[#0D3B2E] px-5 pt-12 pb-6">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-white/60 text-sm font-semibold mb-4 flex items-center gap-1"
              >
                ← Bumalik
              </button>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">{selectedCustomer.name}</h2>
                  {selectedCustomer.phone && (
                    <p className="text-white/50 text-xs mt-0.5">{selectedCustomer.phone}</p>
                  )}
                </div>
              </div>

              {/* Customer utang summary */}
              <div className="flex gap-3 mt-4">
                <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl p-3">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                    Kabuuang Utang
                  </p>
                  <p className="text-white text-xl font-bold mt-1">
                    ₱{(selectedCustomer.total_utang || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl p-3">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                    Hindi pa Bayad
                  </p>
                  <p className="text-white text-xl font-bold mt-1">
                    {selectedCustomer.utang_count}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0D3B2E] h-6 relative shrink-0">
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#F0F4F0] rounded-t-3xl" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">

              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowAddUtang(true)}
                  className="flex-1 bg-[#0D3B2E] text-white rounded-2xl py-3 font-bold text-sm active:scale-95 transition-transform"
                >
                  + Mag-utang
                </button>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer)}
                  className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 font-bold text-sm active:scale-95 transition-transform"
                >
                  🗑️
                </button>
              </div>

              {/* Utang List */}
              {loadingUtang ? (
                <p className="text-center text-gray-400 text-sm py-8">Naglo-load...</p>
              ) : customerUtang.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm font-bold text-[#0D3B2E]">Walang utang!</p>
                  <p className="text-xs text-gray-400 mt-1">Bayad na si {selectedCustomer.name}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {customerUtang.map(u => (
                    <motion.div
                      key={u.id}
                      layout
                      className={`bg-white rounded-2xl border p-4 ${
                        u.is_paid
                          ? 'border-green-100 opacity-60'
                          : 'border-[#E8EDE8]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${
                            u.is_paid ? 'text-gray-400 line-through' : 'text-[#0D3B2E]'
                          }`}>
                            ₱{Number(u.amount).toLocaleString()}
                          </p>
                          {u.item_description && (
                            <p className="text-xs text-gray-400 mt-0.5">{u.item_description}</p>
                          )}
                          <p className="text-[10px] text-gray-300 mt-1">
                            {new Date(u.created_at).toLocaleDateString('fil-PH', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                          {u.is_paid && u.paid_at && (
                            <p className="text-[10px] text-green-500 mt-0.5">
                              Binayaran: {new Date(u.paid_at).toLocaleDateString('fil-PH', {
                                month: 'short', day: 'numeric'
                              })}
                            </p>
                          )}
                        </div>

                        {!u.is_paid && (
                          <button
                            onClick={() => handleMarkPaid(u.id)}
                            className="bg-green-50 border border-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 ml-3"
                          >
                            Bayad ✓
                          </button>
                        )}

                        {u.is_paid && (
                          <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 ml-3">
                            Bayad ✅
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end z-50"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white w-full rounded-t-3xl p-6 pb-10"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h2 className="text-lg font-bold text-[#0D3B2E] mb-5">Bagong Customer</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                    Pangalan
                  </label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="hal. Jose Reyes"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#0D3B2E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                    Phone (optional)
                  </label>
                  <input
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="hal. 09XX XXX XXXX"
                    inputMode="numeric"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#0D3B2E]"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setShowAddCustomer(false); setNewName(''); setNewPhone('') }}
                  className="flex-1 bg-[#F0F4F0] rounded-xl py-3 text-sm font-semibold text-gray-500"
                >
                  Kanselahin
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={savingCustomer}
                  className="flex-1 bg-[#0D3B2E] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-60"
                >
                  {savingCustomer ? 'Sine-save...' : 'I-save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Utang Modal */}
      <AnimatePresence>
        {showAddUtang && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end z-50"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white w-full rounded-t-3xl p-6 pb-10"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h2 className="text-lg font-bold text-[#0D3B2E] mb-1">
                Mag-utang
              </h2>
              <p className="text-sm text-gray-400 mb-5">para kay {selectedCustomer.name}</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                    Halaga (₱)
                  </label>
                  <input
                    inputMode="decimal"
                    value={utangAmount}
                    onChange={e => setUtangAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#0D3B2E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                    Ano ang binili? (optional)
                  </label>
                  <input
                    value={utangItem}
                    onChange={e => setUtangItem(e.target.value)}
                    placeholder="hal. Lucky Me, Kopiko x2"
                    className="w-full border border-gray-100 bg-[#F0F4F0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#0D3B2E]"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setShowAddUtang(false); setUtangAmount(''); setUtangItem('') }}
                  className="flex-1 bg-[#F0F4F0] rounded-xl py-3 text-sm font-semibold text-gray-500"
                >
                  Kanselahin
                </button>
                <button
                  onClick={handleAddUtang}
                  disabled={savingUtang}
                  className="flex-1 bg-[#0D3B2E] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-60"
                >
                  {savingUtang ? 'Sine-save...' : 'I-record ang Utang'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav current="utang" onNavigate={onNavigate} />
    </div>
  )
}