import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'
import { Container } from '../ui/Container'

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <main className={cn('ui-page-container', className)} {...props}><Container>{props.children}</Container></main>
}
