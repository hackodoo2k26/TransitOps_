import { useState, type FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Container } from '../components/ui/Container'
import { fadeIn, fadeUp } from '../lib/motion'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation / API errors
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = (): boolean => {
    setPasswordError('')
    setConfirmError('')
    setGeneralError('')

    if (!token) {
      setGeneralError('Invalid or missing password reset token. Please request a new link.')
      return false
    }

    if (!password) {
      setPasswordError('New password is required')
      return false
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await resetPassword(token, password)
      setSuccessMessage('Password reset successful! Redirecting you to login...')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const error = err as { message?: string }
      setGeneralError(error?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-primary)',
        paddingBlock: 'var(--space-12)',
      }}
    >
      <Container width="narrow">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ maxWidth: '28rem', marginInline: 'auto' }}
        >
          {/* Logo Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-grid',
                  gridTemplateColumns: 'repeat(3, 0.28rem)',
                  alignItems: 'end',
                  gap: '0.18rem',
                  width: '1.55rem',
                  height: '1.55rem',
                  padding: '0.25rem',
                  borderRadius: '0.45rem',
                  backgroundColor: 'var(--color-accent-subtle)',
                }}
              >
                <i style={{ display: 'block', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-accent)', height: '45%' }} />
                <i style={{ display: 'block', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-accent)', height: '72%' }} />
                <i style={{ display: 'block', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-accent)', height: '100%' }} />
              </div>
              <span>TransitOps</span>
            </Link>
          </div>

          <Card variant="glass">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
              Set New Password
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-caption)',
                lineHeight: 1.5,
                marginBottom: 'var(--space-6)',
              }}
            >
              Please enter your new password below. It must be at least 8 characters long.
            </p>

            {successMessage && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  color: 'var(--color-success)',
                  fontSize: 'var(--text-caption)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {generalError && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  backgroundColor: 'rgba(251, 113, 133, 0.12)',
                  border: '1px solid rgba(251, 113, 133, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  color: 'var(--color-error)',
                  fontSize: 'var(--text-caption)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{generalError}</span>
              </motion.div>
            )}

            {!token && (
              <div
                style={{
                  backgroundColor: 'rgba(251, 113, 133, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-caption)',
                  textAlign: 'center',
                  marginBottom: 'var(--space-4)',
                }}
              >
                Reset token is missing from the link. Please request a new reset link.
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <Link
                    to="/forgot-password"
                    style={{ color: 'var(--color-accent)', fontWeight: 650, textDecoration: 'none' }}
                  >
                    Request New Link
                  </Link>
                </div>
              </div>
            )}

            {token && (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div style={{ position: 'relative' }}>
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError}
                    required
                    disabled={isSubmitting}
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

                <div>
                  <Input
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmError}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: 'var(--space-2)' }}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
              <Link
                to="/login"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-caption)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                Back to Sign In
              </Link>
            </div>
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}
