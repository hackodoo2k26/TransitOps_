import type { ReactNode } from 'react'

interface EmptyStateProps { title: string; description?: string; action?: ReactNode }

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return <div className="ui-state"><h2 className="ui-state__title">{title}</h2>{description ? <p>{description}</p> : null}{action}</div>
}
