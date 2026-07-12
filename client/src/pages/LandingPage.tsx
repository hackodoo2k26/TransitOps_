import { Navbar } from '../components/layout/Navbar'
import { Features } from '../components/landing/Features'
import { Hero } from '../components/landing/Hero'

export function LandingPage() {
  return <><Navbar /><main id="home"><Hero /><Features /></main></>
}
