// client/src/components/dashboard/Sidebar.jsx

import { NavLink } from 'react-router-dom'          // useNavigate removed
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react'   // LogOut removed
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ navItems, isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile }) {
  const { user } = useAuth()    // logout removed

  // Role badge color per role
  const roleBadge = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    recruiter: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
    candidate: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">

      {/* ── Logo + collapse toggle ─────────────────────────── */}
      <div className={`flex h-16 items-center border-b border-slate-200 dark:border-slate-800 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        {!isCollapsed && (
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Layers className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Multistack<span className="text-brand-600 dark:text-brand-500">Hire</span>
            </span>
          </NavLink>
        )}

        {isCollapsed && (
          <NavLink to="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Layers className="h-4 w-4" strokeWidth={2} />
          </NavLink>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 md:flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </button>
      </div>

      {/* ── Navigation items ──────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
                      strokeWidth={1.75}
                    />

                    {/* Label — hidden when collapsed */}
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Tooltip when collapsed — desktop only */}
                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm group-hover:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      

      {/* ── User info ─────────── */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            {/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </div> */}
            <div className="min-w-0 flex-1">
              {/* <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user?.full_name}
              </p> */}
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleBadge[user?.role] ?? ''}`}>
                {user?.role}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside
        className={`hidden flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 md:flex ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile overlay ────────────────────────────────── */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}