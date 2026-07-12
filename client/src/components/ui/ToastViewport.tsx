import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

import { cn } from '../../lib/cn'
import { subscribeToasts, type Toast, type ToastTone } from '../../lib/toast'

const toneIconMap: Record<ToastTone, typeof Info> = {
  error: AlertTriangle,
  info: Info,
  success: CheckCircle2,
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToasts((toast) => {
      setToasts((current) => [...current.slice(-2), toast])

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id))
      }, toast.durationMs ?? 4200)
    })

    return unsubscribe
  }, [])

  return (
    <div aria-live="assertive" className="ui-toast-stack" role="status">
      {toasts.map((toast) => {
        const Icon = toneIconMap[toast.tone ?? 'info']

        return (
          <div key={toast.id} className={cn('ui-toast', `ui-toast--${toast.tone ?? 'info'}`)}>
            <div className="ui-toast__icon">
              <Icon aria-hidden="true" size={18} />
            </div>
            <div className="ui-toast__content">
              {toast.title ? <p className="ui-toast__title">{toast.title}</p> : null}
              <p className="ui-toast__message">{toast.message}</p>
            </div>
            <button
              aria-label="Dismiss notification"
              className="ui-toast__close"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
