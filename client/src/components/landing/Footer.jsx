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
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#home" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Layers className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                Multistack<span className="text-brand-600 dark:text-brand-500">Hire</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              An AI-powered candidate ranking and evaluation platform for modern
              technical hiring — built as a final-year university research project.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <GraduationCap className="h-4 w-4" />
              Academic HR-Tech Research Project
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{group}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Multistack Hire. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              aria-label="GitHub"
              className="text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-500"
            >
              <Code2 className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn"
              className="text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-500"
            >
              <Share2 className="h-5 w-5" />
            </a>
            <a
              href="mailto:team@multistackhire.dev"
              aria-label="Email"
              className="text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-500"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
