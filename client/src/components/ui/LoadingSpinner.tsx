import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export function LoadingSpinner({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-label="Loading" className={cn('ui-spinner', className)} role="status" {...props} />
}
