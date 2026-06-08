import { supabase } from './supabase'

// Signs in an existing user with email + password
// Throws an error if credentials are wrong
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}// Creates a new account
// Throws an error if email already exists
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) throw error
  return data
}

// Logs out the current user
// Clears the session token from the browser
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Checks if there's an existing session
// Used on app startup to skip login if already logged in
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}