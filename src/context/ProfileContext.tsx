import { createContext, useContext, useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../lib/profile'
import type { Profile } from '../lib/profile'

// What data the context provides to all components
type ProfileContextType = {
  profile: Profile
  loading: boolean
  updateProfile: (p: Profile) => Promise<void>
}

// Default values — used before the real data loads
// Why: prevents undefined errors on first render
const defaultProfile: Profile = {
  store_name: 'Aking Tindahan',
  location: 'Pilipinas'
}

// Create the context
// Why null as default? Because we'll always wrap with Provider
const ProfileContext = createContext<ProfileContextType | null>(null)

// Provider — wraps the whole app and provides profile data
// Any component inside can access it via useProfile()
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load the profile when the app starts
    loadProfile()
  }, [])

  async function loadProfile() {
    const data = await getProfile()
    if (data) setProfile(data)
    setLoading(false)
  }

  async function updateProfile(newProfile: Profile) {
    await saveProfile(newProfile)
    // Update local state immediately so UI updates instantly
    // Why not reload from DB? Faster UX — optimistic update
    setProfile(newProfile)
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

// Custom hook — makes it easy to use the context
// Why a custom hook? So we don't have to write
// useContext(ProfileContext) every time + handles null check
export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used inside ProfileProvider')
  return context
}