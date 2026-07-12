import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
}

export function Button({ className, type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return <button className={cn('ui-button', `ui-button--${variant}`, className)} type={type} {...props} />
}
