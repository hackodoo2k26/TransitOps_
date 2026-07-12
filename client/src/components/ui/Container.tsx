import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> { width?: 'default' | 'narrow' | 'wide' }

export function Container({ className, width = 'default', ...props }: ContainerProps) {
  return <div className={cn('ui-container', width !== 'default' && `ui-container--${width}`, className)} {...props} />
}
