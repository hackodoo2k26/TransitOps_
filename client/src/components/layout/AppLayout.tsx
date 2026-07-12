import { useMemo, useState } from 'react'
import { Outlet, useMatches } from 'react-router-dom'

import type { AppRouteHandle } from '../../lib/app-navigation'
import { getNavigationItem } from '../../lib/app-navigation'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'

export function AppLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const matches = useMatches()

  const { breadcrumbs, title } = useMemo(() => {
    const matchWithHandle = [...matches].reverse().find((match) => match.handle)
    const handle = matchWithHandle?.handle as AppRouteHandle | undefined
    const fallbackTitle = getNavigationItem(matchWithHandle?.pathname ?? '')?.label ?? 'Dashboard'

    return {
      title: handle?.title ?? fallbackTitle,
      breadcrumbs: handle?.breadcrumbs ?? [{ label: handle?.title ?? fallbackTitle }],
    }
  }, [matches])

  return (
    <div className="app-layout">
      <AppSidebar isDrawerOpen={isDrawerOpen} onCloseDrawer={() => setIsDrawerOpen(false)} />

      <div className="app-layout__main">
        <AppTopbar
          breadcrumbs={breadcrumbs}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          title={title}
        />

        <div className="app-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
