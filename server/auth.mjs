const AUTH_MODE = process.env.KYNEX_AUTH_MODE || 'demo'
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ''

const ROLE_ORDER = {
  viewer: 1,
  reviewer: 2,
  material_master_officer: 3,
  admin: 4,
}

function bearerToken(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

function normaliseRole(value) {
  return Object.hasOwn(ROLE_ORDER, value) ? value : 'viewer'
}

async function verifySupabaseToken(token) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase authentication is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.')
  }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error('Supabase access token is invalid or expired.')
  const user = await response.json()
  const role = normaliseRole(user?.app_metadata?.role || user?.user_metadata?.role)
  return {
    authenticated: true,
    actor: user.id,
    email: user.email || '',
    role,
    provider: 'supabase',
  }
}

export async function authenticate(req) {
  const token = bearerToken(req)
  if (AUTH_MODE === 'required') {
    if (!token) return { authenticated: false, error: 'Authentication required. Supply a Supabase Bearer token.' }
    try {
      return await verifySupabaseToken(token)
    } catch (error) {
      return { authenticated: false, error: error instanceof Error ? error.message : 'Authentication failed.' }
    }
  }

  // Demo mode is deliberately explicit and local-only. It keeps the SIH walkthrough usable
  // without pretending that client-supplied demo roles are production identity proof.
  const requestedRole = String(req.headers['x-kynex-demo-role'] || 'material_master_officer')
  return {
    authenticated: false,
    demo: true,
    actor: 'demo-material-officer',
    email: '',
    role: normaliseRole(requestedRole),
    provider: 'demo',
  }
}

export function hasRole(context, requiredRole) {
  return Boolean(context?.role && ROLE_ORDER[context.role] >= ROLE_ORDER[requiredRole])
}

export function authSummary() {
  return {
    mode: AUTH_MODE,
    provider: AUTH_MODE === 'required' ? 'supabase' : 'explicit-demo-mode',
    configured: Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY),
    roles: Object.keys(ROLE_ORDER),
    note: AUTH_MODE === 'required'
      ? 'Mutating API routes require a verified Supabase access token.'
      : 'Demo mode is for local evaluation only; set KYNEX_AUTH_MODE=required before deployment.',
  }
}
