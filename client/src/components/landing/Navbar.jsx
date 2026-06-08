import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Menu, Moon, Sun, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'About', href: '#about' },
]

export default function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90'
          : 'bg-white/70 backdrop-blur-sm dark:bg-slate-950/70'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Layers className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Multistack<span className="text-brand-600 dark:text-brand-500">Hire</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-500"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-800 dark:hover:text-brand-500"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href="/login"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-500"
          >
            Login
          </a>
          <a
            href="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Get Started
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-slate-200 dark:border-slate-800" />
            <a
              href="/login"
              onClick={closeMobile}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Login
            </a>
            <a
              href="/register"
              onClick={closeMobile}
              className="mt-1 rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-700"
            >
              Get Started
            </a>
          </div>
        </motion.div>
      )}
    </header>
  )
}
