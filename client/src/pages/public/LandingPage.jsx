import Navbar from '../../components/landing/Navbar'
import Hero from '../../components/landing/Hero'
import Stats from '../../components/landing/Stats'
import Features from '../../components/landing/Features'
import Workflow from '../../components/landing/Workflow'
import MLSection from '../../components/landing/MLSection'
import CTA from '../../components/landing/CTA'
import Footer from '../../components/landing/Footer'
import { useTheme } from '../../hooks/useTheme'

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Workflow />
        <MLSection />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
