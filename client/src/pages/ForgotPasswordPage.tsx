import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Container } from '../components/ui/Container'
import { fadeIn, fadeUp } from '../lib/motion'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = (): boolean => {
    setEmailError('')
    setGeneralError('')
    setSuccessMessage('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await forgotPassword(email)
      setSuccessMessage('If the email exists, a secure password reset link has been sent.')
      setEmail('')
    } catch (err) {
      const error = err as { message?: string }
      setGeneralError(error?.message || 'Failed to submit password reset request. Please try again.')
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
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-caption)',
                textDecoration: 'none',
                marginBottom: 'var(--space-6)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>

            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
              Reset Password
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-caption)',
                lineHeight: 1.5,
                marginBottom: 'var(--space-6)',
              }}
            >
              Enter the email address associated with your TransitOps account, and we will send you instructions to reset your password.
            </p>

            {successMessage && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  color: 'var(--color-success)',
                  fontSize: 'var(--text-caption)',
                  marginBottom: 'var(--space-6)',
                  lineHeight: 1.4,
                }}
              >
                <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
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

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-5)' }}>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                required
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}
