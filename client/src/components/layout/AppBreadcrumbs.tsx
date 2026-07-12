import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { AppBreadcrumb } from '../../lib/app-navigation'
import { cn } from '../../lib/cn'

interface AppBreadcrumbsProps {
  className?: string
  items: AppBreadcrumb[]
}

export function AppBreadcrumbs({ className, items }: AppBreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('app-breadcrumbs', className)}>
      <ol className="app-breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li className="app-breadcrumbs__item" key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link className="app-breadcrumbs__link" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="app-breadcrumbs__current">
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight aria-hidden="true" className="app-breadcrumbs__separator" size={14} /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
