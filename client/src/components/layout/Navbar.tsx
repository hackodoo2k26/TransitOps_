import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../ui/Button'
import { Container } from '../ui/Container'

const navigationItems = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
] as const

type NavigationLabel = (typeof navigationItems)[number]['label']

interface NavbarProps {
  activeItem?: NavigationLabel
}

export function Navbar({ activeItem = 'Home' }: NavbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 8)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    if (!isDrawerOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isDrawerOpen])

  const closeDrawer = () => setIsDrawerOpen(false)

  return <header className={`app-navbar ${isScrolled ? 'app-navbar--scrolled' : ''}`}>
    <Container width="wide">
      <nav aria-label="Primary navigation" className="app-navbar__inner">
        <a aria-label="TransitOps home" className="app-navbar__brand" href="#home">
          <span aria-hidden="true" className="app-navbar__mark"><i /><i /><i /></span>
          <span>TransitOps</span>
        </a>

        <div className="app-navbar__links">
          {navigationItems.map((item) => <a aria-current={activeItem === item.label ? 'page' : undefined} className="app-navbar__link" href={item.href} key={item.label}>{item.label}</a>)}
        </div>

        <div className="app-navbar__actions">
          <Button onClick={() => navigate('/login')} variant="secondary">Login</Button>
          <Button>Start Free Trial</Button>
        </div>

        <Button aria-controls="mobile-navigation" aria-expanded={isDrawerOpen} aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'} className="app-navbar__menu" onClick={() => setIsDrawerOpen((open) => !open)} variant="ghost">
          {isDrawerOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </Button>
      </nav>
    </Container>

    <AnimatePresence>
      {isDrawerOpen ? <motion.div animate="visible" className="app-navbar__drawer-backdrop" exit="hidden" initial="hidden" onMouseDown={closeDrawer} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <motion.div animate="visible" className="app-navbar__drawer" id="mobile-navigation" initial="hidden" onMouseDown={(event) => event.stopPropagation()} role="dialog" transition={{ type: 'spring', damping: 28, stiffness: 320 }} variants={{ hidden: { x: '100%' }, visible: { x: 0 } }}>
          <div className="app-navbar__drawer-header"><span className="app-navbar__brand">TransitOps</span><Button aria-label="Close navigation menu" onClick={closeDrawer} variant="ghost"><X aria-hidden="true" size={22} /></Button></div>
          <div className="app-navbar__drawer-links">{navigationItems.map((item) => <a aria-current={activeItem === item.label ? 'page' : undefined} className="app-navbar__drawer-link" href={item.href} key={item.label} onClick={closeDrawer}>{item.label}</a>)}</div>
          <div className="app-navbar__drawer-actions"><Button onClick={() => { closeDrawer(); navigate('/login') }} variant="secondary">Login</Button><Button onClick={closeDrawer}>Start Free Trial</Button></div>
        </motion.div>
      </motion.div> : null}
    </AnimatePresence>
  </header>
}
