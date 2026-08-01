import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import {
  Menu, Sun, Moon, LogOut, ChevronDown,
  User, Settings, Building2, BarChart3,
  Users, Brain
} from 'lucide-react'

const pageTitles = {
  '/candidate/dashboard':  'Dashboard',
  '/candidate/profile':    'My Profile',
  '/candidate/resume':     'Resume Upload',
  '/candidate/ranking':    'My Ranking',
  '/candidate/settings':   'Settings',
  '/candidate/jobs':       'Browse Jobs',
  '/recruiter/dashboard':  'Dashboard',
  '/recruiter/jobs':       'Job Postings',
  '/recruiter/company':    'Company Profile',
  '/recruiter/search':     'Candidate Search',
  '/recruiter/shortlist':  'Shortlist',
  '/recruiter/analytics':  'Analytics',
  '/admin/dashboard':      'Dashboard',
  '/admin/users':          'User Management',
  '/admin/model':          'ML Model',
  '/admin/model/retrain':  'Retrain Model',
  '/admin/analytics':      'System Analytics',
  '/admin/login': 'Admin Login',
}

const roleMenuItems = {
  candidate: [
    { label: 'My Profile',  icon: User,     path: '/candidate/profile' },
    { label: 'Settings',    icon: Settings,  path: '/candidate/settings' },
  ],
  recruiter: [
    { label: 'Company',    icon: Building2, path: '/recruiter/company' },
    { label: 'Analytics',  icon: BarChart3,  path: '/recruiter/analytics' },
  ],
  admin: [
    { label: 'User Management', icon: Users,  path: '/admin/users' },
    { label: 'ML Model',        icon: Brain,  path: '/admin/model' },
  ],
}

const roleBadgeColor = {
  admin:     'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  recruiter: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  candidate: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
}

export default function TopBar({ onOpenMobile }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const pageTitle = pageTitles[location.pathname] ?? 'Dashboard'
  const menuItems = roleMenuItems[user?.role] ?? []

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleCloseDropdown() {
    setDropdownOpen(false)
  }

  function handleLogout() {
    setDropdownOpen(false)
    logout()
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:border-brand-300 hover:text-brand-600 hover:shadow-sm dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-3 transition-all hover:border-brand-300 hover:shadow-sm dark:border-slate-700 dark:hover:border-brand-700"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white shadow">
              {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 sm:block max-w-[120px] truncate">
              {user?.full_name?.split(' ')[0]}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-[9999] mt-2 w-56 min-w-[14rem] overflow-visible rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white shadow">
                    {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeColor[user?.role]}`}>
                  {user?.role}
                </span>
              </div>
              <div className="py-1.5">
                {menuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleCloseDropdown}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <item.icon className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-slate-100 py-1.5 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}