import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> { variant?: 'standard' | 'glass' }

export function Card({ className, variant = 'standard', ...props }: CardProps) {
  return <div className={cn('ui-card', variant === 'glass' && 'ui-card--glass', className)} {...props} />
}
