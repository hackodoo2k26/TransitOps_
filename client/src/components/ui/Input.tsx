import { useId, type InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }

export function Input({ className, error, id, label, required, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return <div className="ui-field"><label className="ui-field__label" htmlFor={inputId}>{label}{label && required ? <span className="ui-field__required"> *</span> : null}</label><input aria-invalid={Boolean(error)} className={cn('ui-input', className)} id={inputId} required={required} {...props} />{error ? <span className="ui-field__error">{error}</span> : null}</div>
}
