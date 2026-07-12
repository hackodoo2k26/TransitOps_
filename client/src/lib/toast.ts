export type ToastTone = 'error' | 'info' | 'success'

export type Toast = {
  durationMs?: number
  id: string
  message: string
  title?: string
  tone?: ToastTone
}

type ToastInput = Omit<Toast, 'id'>
type ToastListener = (toast: Toast) => void

const listeners = new Set<ToastListener>()
let toastSequence = 0

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function showToast(input: ToastInput) {
  const toast: Toast = {
    id: `toast-${Date.now()}-${toastSequence++}`,
    tone: 'info',
    durationMs: 4200,
    ...input,
  }

  listeners.forEach((listener) => listener(toast))
  return toast.id
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (error && typeof error === 'object') {
    const maybeError = error as {
      errors?: Array<{ message?: string }>
      message?: string
    }

    if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
      return maybeError.message
    }

    if (Array.isArray(maybeError.errors)) {
      const firstIssue = maybeError.errors.find((issue) => typeof issue.message === 'string' && issue.message.trim())
      if (firstIssue?.message) {
        return firstIssue.message
      }
    }
  }

  return fallback
}

export function showErrorToast(error: unknown, fallback?: string) {
  return showToast({
    tone: 'error',
    title: 'Request failed',
    message: getErrorMessage(error, fallback),
  })
}
