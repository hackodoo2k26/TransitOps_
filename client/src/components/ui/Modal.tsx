import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from './Button'

interface ModalProps { children: ReactNode; isOpen: boolean; onClose: () => void; title: string }

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null
  return <div aria-modal="true" className="ui-modal-backdrop" onMouseDown={onClose} role="dialog"><div className="ui-modal" onMouseDown={(event) => event.stopPropagation()}><div className="ui-modal__header"><h2 className="ui-modal__title">{title}</h2><Button aria-label="Close modal" onClick={onClose} variant="ghost"><X aria-hidden="true" size={18} /></Button></div>{children}</div></div>
}
