import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Menu, Moon, Sun, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Architecture', href: '#about' },
]

export default function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-slate-200/50 bg-white/70 shadow-[0_2px_20px_-2px_rgba(0,0,0,0.02)] backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/75'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] dark:bg-brand-500">
            <Layers className="h-5 w-5 transition-transform duration-500 group-hover:rotate-12" strokeWidth={2} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 transition-colors duration-300 dark:text-white">
            Multistack<span className="text-brand-600 transition-colors duration-300 group-hover:text-brand-700 dark:text-brand-400 dark:group-hover:text-brand-300">Hire</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-brand-500 transition-all duration-300 hover:w-full" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/50 text-slate-600 shadow-sm transition-all duration-300 hover:border-brand-300 hover:bg-slate-50 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-slate-900 dark:hover:text-brand-400"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-brand-600 px-4.5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:translate-y-[-1px] active:translate-y-[0px] dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-200/80 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-lg md:hidden dark:border-slate-800/80 dark:bg-slate-950/95"
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-slate-200/60 dark:border-slate-800/60" />
              <Link
                to="/login"
                onClick={closeMobile}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMobile}
                className="mt-1 rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-brand-700"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
