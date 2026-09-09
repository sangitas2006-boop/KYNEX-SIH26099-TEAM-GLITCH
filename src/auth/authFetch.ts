import { supabase } from '../lib/supabase'

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers)

  if (supabase) {
    const { data } = await supabase.auth.getSession()
    if (data.session?.access_token) {
      headers.set('Authorization', `Bearer ${data.session.access_token}`)
    }
  } else if (window.localStorage.getItem('kynex_guest_session') === 'true') {
    headers.set('x-kynex-demo-role', 'viewer')
  }

  return fetch(input, { ...init, headers })
}
