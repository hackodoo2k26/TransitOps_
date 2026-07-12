import type { ReactNode } from 'react'

interface ErrorStateProps { title?: string; description?: string; action?: ReactNode }

export function ErrorState({ action, description = 'Please try again shortly.', title = 'Something went wrong' }: ErrorStateProps) {
  return <div className="ui-state" role="alert"><h2 className="ui-state__title">{title}</h2><p>{description}</p>{action}</div>
}
