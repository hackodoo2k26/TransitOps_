import type { ReactNode } from 'react'

import { Container } from '../ui/Container'

interface FooterProps { children?: ReactNode }

export function Footer({ children }: FooterProps) {
  return <footer className="app-footer"><Container><div className="app-footer__inner">{children}</div></Container></footer>
}
