import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { X } from 'lucide-react'

import { cn } from '../../lib/cn'
import { Button } from './Button'

interface ModalProps {
  children: ReactNode
  className?: string
  isOpen: boolean
  maxWidth?: string
  onClose: () => void
  title: string
}

export function Modal({ children, className, isOpen, maxWidth, onClose, title }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null
  const style = (maxWidth ? { '--ui-modal-width': maxWidth } : undefined) as CSSProperties | undefined

  return <div aria-modal="true" className="ui-modal-backdrop" onMouseDown={onClose} role="dialog"><div className={cn('ui-modal', className)} onMouseDown={(event) => event.stopPropagation()} style={style}><div className="ui-modal__header"><h2 className="ui-modal__title">{title}</h2><Button aria-label="Close modal" onClick={onClose} variant="ghost"><X aria-hidden="true" size={18} /></Button></div>{children}</div></div>
}
