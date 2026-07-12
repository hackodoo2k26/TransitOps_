import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { fadeIn, fadeUp } from '../lib/motion'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation / API errors
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')

  // Redirect target
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'

  const triggerGeneralError = (msg: string) => {
    setGeneralError(msg)
    // Automatically dismiss the error panel after 6 seconds to avoid permanent display
    setTimeout(() => {
      setGeneralError((curr) => (curr === msg ? '' : curr))
    }, 6000)
  }

  const validateForm = (): boolean => {
    let valid = true
    setEmailError('')
    setPasswordError('')
    setGeneralError('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      valid = false
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      valid = false
    }

    if (!password) {
      setPasswordError('Password is required')
      valid = false
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      valid = false
    }

    return valid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setGeneralError('')

    try {
      await login(email, password, rememberMe)
      navigate(from, { replace: true })
    } catch (err) {
      const error = err as { message?: string; errors?: Array<{ path?: string[]; message: string }> }
      if (error?.errors && Array.isArray(error.errors)) {
        // Handle precise backend validator issues
        error.errors.forEach((issue) => {
          const path = issue.path?.[0]
          if (path === 'email') {
            setEmailError(issue.message)
          } else if (path === 'password') {
            setPasswordError(issue.message)
          }
        })
      }
      triggerGeneralError(error?.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-split">
      {/* Left Panel: Light Neutral Background */}
      <div className="login-split__left">
        <div>
          <Link to="/" className="login-split__brand">
            <span className="login-split__logo-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>TransitOps</span>
          </Link>
        </div>

        <div className="login-split__left-content">
          <h2 className="login-split__title">Smart Transport Operations Platform</h2>
          <p className="login-split__intro">
            TransitOps connects fleet assets, drivers, routing operations, and finances into a unified transport operations ecosystem.
          </p>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <h3 className="login-split__roles-title">Supported Roles</h3>
            <ul className="login-split__roles-list">
              <li className="login-split__role-item">
                <span className="login-split__role-dot" />
                Fleet Manager
              </li>
              <li className="login-split__role-item">
                <span className="login-split__role-dot" />
                Dispatcher
              </li>
              <li className="login-split__role-item">
                <span className="login-split__role-dot" />
                Safety Officer
              </li>
              <li className="login-split__role-item">
                <span className="login-split__role-dot" />
                Financial Analyst
              </li>
            </ul>
          </div>
        </div>

        <div className="login-split__footer">
          <p>© 2026 TransitOps. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel: Dark Premium Background */}
      <div className="login-split__right">
        <div className="login-split__form-container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card variant="glass">
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                Sign In
              </h2>

              <AnimatePresence>
                {generalError && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeIn}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-2)',
                      backgroundColor: 'rgba(251, 113, 133, 0.12)',
                      border: '1px solid rgba(251, 113, 133, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      color: 'var(--color-error)',
                      fontSize: 'var(--text-caption)',
                      marginBottom: 'var(--space-5)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{generalError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGeneralError('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      aria-label="Dismiss alert"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError}
                    required
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 'var(--space-3)',
                      top: '2.45rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--text-caption)',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        accentColor: 'var(--color-accent)',
                        cursor: 'pointer',
                      }}
                    />
                    Remember Me
                  </label>

                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: 'var(--space-2)' }}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
