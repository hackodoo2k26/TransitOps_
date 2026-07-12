import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

import { appNavigationItems } from '../../lib/app-navigation'
import { hasAnyRole } from '../../lib/access'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

interface AppSidebarProps {
  isDrawerOpen: boolean
  onCloseDrawer: () => void
}

function SidebarNav({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { user } = useAuth()
  const visibleItems = appNavigationItems.filter((item) => !item.roles || hasAnyRole(user, item.roles))

  return (
    <nav aria-label="Application" className={cn('app-sidebar__nav', className)}>
      <ul className="app-sidebar__list">
        {visibleItems.map(({ icon: Icon, label, path }) => (
          <li key={path}>
            <NavLink
              className={({ isActive }) => cn('app-sidebar__link', isActive && 'app-sidebar__link--active')}
              end={path === '/dashboard'}
              onClick={onNavigate}
              to={path}
            >
              <span aria-hidden="true" className="app-sidebar__icon">
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function AppSidebar({ isDrawerOpen, onCloseDrawer }: AppSidebarProps) {
  useEffect(() => {
    if (!isDrawerOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseDrawer()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isDrawerOpen, onCloseDrawer])

  return (
    <>
      <aside aria-label="Sidebar" className="app-sidebar">
        <div className="app-sidebar__brand">
          <span aria-hidden="true" className="app-sidebar__mark">
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>TransitOps</strong>
            <span>Operations</span>
          </div>
        </div>
        <SidebarNav />
      </aside>

      <AnimatePresence>
        {isDrawerOpen ? (
          <motion.div
            animate="visible"
            className="app-sidebar__drawer-backdrop"
            exit="hidden"
            initial="hidden"
            onMouseDown={onCloseDrawer}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            <motion.aside
              animate="visible"
              aria-label="Sidebar"
              className="app-sidebar app-sidebar--drawer"
              exit="hidden"
              id="app-sidebar-drawer"
              initial="hidden"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              variants={{ hidden: { x: '-100%' }, visible: { x: 0 } }}
            >
              <div className="app-sidebar__drawer-header">
                <div className="app-sidebar__brand">
                  <span aria-hidden="true" className="app-sidebar__mark">
                    <i />
                    <i />
                    <i />
                  </span>
                  <div>
                    <strong>TransitOps</strong>
                    <span>Operations</span>
                  </div>
                </div>
                <Button aria-label="Close navigation menu" onClick={onCloseDrawer} variant="ghost">
                  <X aria-hidden="true" size={22} />
                </Button>
              </div>
              <SidebarNav onNavigate={onCloseDrawer} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
