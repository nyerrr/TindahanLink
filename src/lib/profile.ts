import { supabase } from './supabase'

export type Profile = {
  store_name: string
  location: string
}

// Get the profile of the currently logged-in user
// Returns null if no profile exists yet (first time login)
export async function getProfile(): Promise<Profile | null> {
  // auth.getUser() gives us the currently logged-in user
  // Why not pass user_id as param? Because we always
  // want the CURRENT user's profile, not anyone else's
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('store_name, location')
    .eq('user_id', user.id)
    .single() // Why single()? We expect exactly one row per user

  if (error) return null
  return data
}

// Create or update the profile
// Why upsert? Because on first login the profile doesn't exist yet
// upsert = insert if not exists, update if exists
export async function saveProfile(profile: Profile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      store_name: profile.store_name,
      location: profile.location,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id' // if user_id already exists, update it
    })

  if (error) throw error
}