import { NavLink } from 'react-router-dom'
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ navItems, isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile }) {
  const { user } = useAuth()

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo + toggle */}
      <div className={`flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        {!isCollapsed ? (
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
              <Layers className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Multistack<span className="text-brand-600 dark:text-brand-500">Hire</span>
            </span>
          </NavLink>
        ) : (
          <NavLink to="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
            <Layers className="h-4 w-4" strokeWidth={2} />
          </NavLink>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 md:flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-950/40 dark:text-brand-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                      strokeWidth={1.75}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md group-hover:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {item.label}
                      </div>
                    )}
                    {isActive && !isCollapsed && (
                      <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      <aside
        className={`hidden flex-col border-r border-slate-200 bg-white/80 backdrop-blur-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/80 md:flex ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
      {isMobileOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={onCloseMobile} />
          <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}