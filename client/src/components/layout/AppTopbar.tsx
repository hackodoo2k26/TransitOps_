import { Bell, Menu, Search } from 'lucide-react'

import type { AppBreadcrumb } from '../../lib/app-navigation'
import { Button } from '../ui/Button'
import { AppBreadcrumbs } from './AppBreadcrumbs'

interface AppTopbarProps {
  breadcrumbs: AppBreadcrumb[]
  onOpenDrawer: () => void
  title: string
}

export function AppTopbar({ breadcrumbs, onOpenDrawer, title }: AppTopbarProps) {
  return (
    <header className="app-topbar">
      <div className="app-topbar__primary">
        <Button
          aria-controls="app-sidebar-drawer"
          aria-label="Open navigation menu"
          className="app-topbar__menu"
          onClick={onOpenDrawer}
          variant="ghost"
        >
          <Menu aria-hidden="true" size={22} />
        </Button>

        <div className="app-topbar__heading">
          <AppBreadcrumbs items={breadcrumbs} />
          <h1 className="app-topbar__title">{title}</h1>
        </div>

        <div className="app-topbar__actions">
          <label className="app-topbar__search">
            <Search aria-hidden="true" size={18} />
            <input aria-label="Search fleet, drivers, and trips" placeholder="Search..." type="search" />
          </label>

          <Button aria-label="Notifications" className="app-topbar__icon-button" variant="ghost">
            <Bell aria-hidden="true" size={20} />
            <span aria-hidden="true" className="app-topbar__notification-dot" />
          </Button>

          <div aria-label="User profile" className="app-topbar__profile" role="group">
            <span aria-hidden="true" className="app-topbar__avatar">
              SO
            </span>
            <div className="app-topbar__profile-copy">
              <span className="app-topbar__profile-name">Shrey Ops</span>
              <span className="app-topbar__profile-role">Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
