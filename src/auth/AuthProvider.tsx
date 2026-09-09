import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const GUEST_STORAGE_KEY = 'kynex_guest_session'

type AuthMode = 'loading' | 'signed_out' | 'guest' | 'authenticated'

interface AuthContextValue {
  mode: AuthMode
  session: Session | null
  user: User | null
  isGuest: boolean
  isAuthenticated: boolean
  supabaseConfigured: boolean
  continueAsGuest: () => void
  signIn: (email: string, password: string) => Promise<{ needsEmailConfirmation?: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation?: boolean; error?: string }>
  resendConfirmation: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function friendlyAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) return 'The email or password is incorrect.'
  if (/email not confirmed/i.test(message)) return 'Confirm your email before signing in.'
  if (/already registered|already been registered/i.test(message)) return 'An account with this email already exists. Try signing in.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode>('loading')
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let mounted = true

    if (!isSupabaseConfigured || !supabase) {
      setMode(window.localStorage.getItem(GUEST_STORAGE_KEY) === 'true' ? 'guest' : 'signed_out')
      return () => { mounted = false }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setMode(data.session ? 'authenticated' : (window.localStorage.getItem(GUEST_STORAGE_KEY) === 'true' ? 'guest' : 'signed_out'))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      if (nextSession) {
        window.localStorage.removeItem(GUEST_STORAGE_KEY)
        setMode('authenticated')
      } else if (window.localStorage.getItem(GUEST_STORAGE_KEY) === 'true') {
        setMode('guest')
      } else {
        setMode('signed_out')
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    mode,
    session,
    user: session?.user ?? null,
    isGuest: mode === 'guest',
    isAuthenticated: mode === 'authenticated',
    supabaseConfigured: isSupabaseConfigured,
    continueAsGuest: () => {
      window.localStorage.setItem(GUEST_STORAGE_KEY, 'true')
      setMode('guest')
    },
    signIn: async (email, password) => {
      if (!supabase) return { error: 'Supabase is not configured yet. Use guest mode for the local demo.' }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      return error ? { error: friendlyAuthError(error.message) } : {}
    },
    signUp: async (email, password) => {
      if (!supabase) return { error: 'Supabase is not configured yet. Use guest mode for the local demo.' }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      return error
        ? { error: friendlyAuthError(error.message) }
        : { needsEmailConfirmation: !data.session }
    },
    resendConfirmation: async (email) => {
      if (!supabase) return { error: 'Supabase is not configured yet.' }
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      })
      return error ? { error: friendlyAuthError(error.message) } : {}
    },
    signOut: async () => {
      window.localStorage.removeItem(GUEST_STORAGE_KEY)
      if (supabase) await supabase.auth.signOut()
      setSession(null)
      setMode('signed_out')
    },
  }), [mode, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
