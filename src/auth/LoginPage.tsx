import { FormEvent, useState } from 'react'
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from './AuthProvider'

export function LoginPage() {
    const { signIn, signUp, resendConfirmation, continueAsGuest, supabaseConfigured } = useAuth()
    const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [busy, setBusy] = useState(false)
    const [resending, setResending] = useState(false)
    const [showResend, setShowResend] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'error' | 'success'>('error')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setBusy(true)
        setMessage('')
        setShowResend(false)

        const result = mode === 'sign-in'
          ? await signIn(email, password)
                : await signUp(email, password)

        if (result.error) {
                setMessageType('error')
                setMessage(result.error)
                setShowResend(/confirm|already exists/i.test(result.error))
        } else if (result.needsEmailConfirmation) {
                setMessageType('success')
                setMessage('Account created. Check your email to confirm access, then sign in.')
                setShowResend(true)
                setMode('sign-in')
                setPassword('')
        }
        setBusy(false)
  }

  const resend = async () => {
        setResending(true)
        const result = await resendConfirmation(email)
        setMessageType(result.error ? 'error' : 'success')
        setMessage(result.error || 'A new confirmation email was sent. Open the newest email on this device.')
        setResending(false)
  }

  return (
        <main className="auth-page">
              <div className="auth-atmosphere" aria-hidden="true" />
              <div className="auth-shell">
                      <section className="auth-story">
                                <a className="auth-brand" href="#/" aria-label="KYNEX home">
                                            <span className="auth-brand-mark"><img src="/kynex-logo.png" alt="" /></span>span>
                                            <span><strong>KYNEX</strong>strong><small>Material identity resolution platform</small>small></span>span>
                                </a>a>
                                <div className="auth-story-copy">
                                            <span className="auth-eyebrow"><ShieldCheck size={14} /> Evidence gate active</span>span>
                                            <h1>Make the record understandable before it becomes a decision.</h1>h1>
                                            <p>Sign in to continue to your governed workspace, or explore the full KYNEX workflow in a controlled workspace.</p>p>
                                </div>div>
                                <div className="auth-proof-list" aria-label="KYNEX access principles">
                                            <span><CheckCircle2 size={15} /> Source records stay intact</span>span>
                                            <span><CheckCircle2 size={15} /> Conflicts remain visible</span>span>
                                            <span><CheckCircle2 size={15} /> Publishing stays accountable</span>span>
                                </div>div>
                      </section>section>
              
                      <section className="auth-card" aria-labelledby="auth-title">
                                <div className="auth-card-heading">
                                            <span className="auth-card-kicker"><LockKeyhole size={14} /> Secure workspace access</span>span>
                                            <h2 id="auth-title">{mode === 'sign-in' ? 'Welcome back.' : 'Create your workspace account.'}</h2>h2>
                                            <p>{mode === 'sign-in' ? 'Sign in to continue to KYNEX.' : 'Use an email account to save your workspace session.'}</p>p>
                                </div>div>
                      
                                <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
                                            <button className={mode === 'sign-in' ? 'active' : ''} role="tab" aria-selected={mode === 'sign-in'} onClick={() => { setMode('sign-in'); setMessage('') }}>Sign in</button>button>
                                            <button className={mode === 'sign-up' ? 'active' : ''} role="tab" aria-selected={mode === 'sign-up'} onClick={() => { setMode('sign-up'); setMessage('') }}>Sign up</button>button>
                                </div>div>
                      
                                <form className="auth-form" onSubmit={submit}>
                                            <label>
                                                          <span>Email address</span>span>
                                                          <input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@organisation.com" required />
                                            </label>label>
                                            <label>
                                                          <span>Password</span>span>
                                                          <div className="auth-password-field">
                                                                          <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required />
                                                                          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>button>
                                                          </div>div>
                                            </label>label>
                                  {message && <div className={`auth-message ${messageType}`} role={messageType === 'error' ? 'alert' : 'status'}>{message}</div>div>}
                                  {showResend && supabaseConfigured && email && (
                        <button className="auth-resend" type="button" onClick={resend} disabled={resending}>
                          {resending ? 'Sending…' : 'Resend confirmation email'}
                        </button>button>
                                            )}
                                            <button className="button primary auth-submit" type="submit" disabled={busy}>
                                              {busy ? 'Connecting…' : mode === 'sign-in' ? 'Sign in to KYNEX' : 'Create account'}
                                              {!busy && <ArrowRight size={16} />}
                                            </button>button>
                                </form>form>
                      
                                <div className="auth-divider"><span>or</span>span></div>div>
                                <button className="button outline auth-guest" onClick={continueAsGuest}>
                                            Continue as guest <ArrowRight size={16} />
                                </button>button>
                                <p className="auth-guest-note">Controlled workspace · source records protected · publishing and external writes disabled</p>p>
                        {!supabaseConfigured && <p className="auth-config-note">Supabase is not connected in this local build yet. Guest mode is available now; sign-in and sign-up will activate when the project variables are configured.</p>p>}
                      </section>section>
              </div>div>
        </main>main>
      )
}
</main>
