import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardShell({ navItems }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar
        navItems={navItems}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-visible">
        <TopBar onOpenMobile={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}