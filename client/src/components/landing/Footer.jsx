import { Link } from 'react-router-dom'
import { Code2, GraduationCap, Layers, Mail, Share2 } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'ML Architecture', href: '#about' },
  ],
  Account: [
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' },
    { label: 'Get Started', href: '/register' },
  ],
  Project: [
    { label: 'About', href: '#about' },
    { label: 'Documentation', href: '#' },
    { label: 'Contact', href: 'mailto:team@multistackhire.dev' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800/85 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Logo and research desc */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#home" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white transition-all group-hover:scale-105 dark:bg-brand-500">
                <Layers className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Multistack<span className="text-brand-600 dark:text-brand-400">Hire</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              An AI-powered candidate evaluation and ranking platform for modern software recruitment, developed as a university research project.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <GraduationCap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              HR-Tech Academic Thesis
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {group}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row dark:border-slate-800/80">
          <p className="text-xs text-slate-400 dark:text-slate-550">
            &copy; {new Date().getFullYear()} Multistack Hire. All rights reserved. Designed for research evaluation.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              aria-label="GitHub"
              className="text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
            >
              <Code2 className="h-4.5 w-4.5" />
            </a>
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn"
              className="text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
            >
              <Share2 className="h-4.5 w-4.5" />
            </a>
            <a
              href="mailto:team@multistackhire.dev"
              aria-label="Email"
              className="text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
            >
              <Mail className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
