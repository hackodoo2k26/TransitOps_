import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; children: ReactNode }

export function Select({ children, className, error, id, label, required, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return <div className="ui-field"><label className="ui-field__label" htmlFor={selectId}>{label}{label && required ? <span className="ui-field__required"> *</span> : null}</label><select aria-invalid={Boolean(error)} className={cn('ui-select', className)} id={selectId} required={required} {...props}>{children}</select>{error ? <span className="ui-field__error">{error}</span> : null}</div>
}
