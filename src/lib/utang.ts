import { supabase } from './supabase'

export type Customer = {
  id: string
  name: string
  phone: string | null
  total_utang?: number // computed from utang table
  utang_count?: number
}

export type Utang = {
  id: string
  customer_id: string
  amount: number
  item_description: string | null
  is_paid: boolean
  created_at: string
  paid_at: string | null
}

// Get all customers with their total unpaid utang
// Why join? So we can show "Jose - ₱150 utang" in one query
export async function getCustomers(): Promise<Customer[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      phone,
      utang(amount, is_paid)
    `)
    .eq('user_id', user.id)
    .order('name')

  if (error) return []

  // Calculate total unpaid utang per customer
  // Why here and not in SQL? Simpler to compute in JS for now
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    total_utang: c.utang
      .filter((u: any) => !u.is_paid)
      .reduce((sum: number, u: any) => sum + Number(u.amount), 0),
    utang_count: c.utang.filter((u: any) => !u.is_paid).length
  }))
}

// Get all utang records for a specific customer
export async function getCustomerUtang(customerId: string): Promise<Utang[]> {
  const { data, error } = await supabase
    .from('utang')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// Add a new customer
export async function addCustomer(name: string, phone: string): Promise<Customer | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('customers')
    .insert({ name, phone, user_id: user.id })
    .select()
    .single()

  if (error) return null
  return data
}

// Record a new utang transaction
export async function addUtang(
  customerId: string,
  amount: number,
  itemDescription: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('utang')
    .insert({
      customer_id: customerId,
      user_id: user.id,
      amount,
      item_description: itemDescription
    })

  if (error) throw error
}

// Mark a specific utang as paid
// Why set paid_at? So we have a timestamp of when it was paid
export async function markAsPaid(utangId: string): Promise<void> {
  const { error } = await supabase
    .from('utang')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString()
    })
    .eq('id', utangId)

  if (error) throw error
}

// Delete a customer and all their utang
// Why cascade? The DB already handles this via
// "on delete cascade" in the utang table definition
export async function deleteCustomer(customerId: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)

  if (error) throw error
}