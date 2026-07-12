import { Card } from '../ui/Card'

interface AppPagePlaceholderProps {
  description?: string
  title: string
}

export function AppPagePlaceholder({ description, title }: AppPagePlaceholderProps) {
  return (
    <Card className="app-page" variant="glass">
      <h2 className="app-page__title">{title}</h2>
      <p className="app-page__description">{description ?? 'Page content coming soon.'}</p>
    </Card>
  )
}
