// client/src/components/dashboard/TopBar.jsx

import { Menu, Sun, Moon } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'


// Map route paths to human-readable page titles
const pageTitles = {
  '/candidate/dashboard': 'Dashboard',
  '/candidate/profile': 'My Profile',
  '/candidate/resume': 'Resume Upload',
  '/candidate/ranking': 'My Ranking',
  '/candidate/settings': 'Settings',
  '/recruiter/dashboard': 'Dashboard',
  '/recruiter/search': 'Candidate Search',
  '/recruiter/shortlist': 'Shortlist',
  '/recruiter/analytics': 'Analytics',
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/model': 'ML Model',
  '/admin/model/retrain': 'Retrain Model',
  '/admin/analytics': 'System Analytics',
   '/recruiter/jobs': 'Job Postings',
  '/candidate/jobs': 'Browse Jobs',
  '/recruiter/company': 'Company Profile',

}

export default function TopBar({ onOpenMobile }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const pageTitle = pageTitles[location.pathname] ?? 'Dashboard'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">

      {/* Left — hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base font-semibold text-slate-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>

      {/* Right — theme toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-800 dark:hover:text-brand-500"
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />
          }
        </button>
      </div>
    </header>
  )
} 