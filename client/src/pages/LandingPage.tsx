import { Navbar } from '../components/layout/Navbar'
import { Features } from '../components/landing/Features'
import { Hero } from '../components/landing/Hero'
import { ProductShowcase } from '../components/landing/ProductShowcase'

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="home">
        <Hero />
        <Features />
        <ProductShowcase />
      </main>
    </>
  )
}
