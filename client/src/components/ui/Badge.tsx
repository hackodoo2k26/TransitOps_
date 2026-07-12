import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error' }

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return <span className={cn('ui-badge', variant !== 'neutral' && `ui-badge--${variant}`, className)} {...props} />
}
