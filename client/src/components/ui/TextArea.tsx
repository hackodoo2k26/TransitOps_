import { useId, type TextareaHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string }

export function TextArea({ className, error, id, label, required, ...props }: TextAreaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return <div className="ui-field"><label className="ui-field__label" htmlFor={textareaId}>{label}{label && required ? <span className="ui-field__required"> *</span> : null}</label><textarea aria-invalid={Boolean(error)} className={cn('ui-textarea', className)} id={textareaId} required={required} {...props} />{error ? <span className="ui-field__error">{error}</span> : null}</div>
}
