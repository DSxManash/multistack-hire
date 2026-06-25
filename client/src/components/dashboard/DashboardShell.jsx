// client/src/components/dashboard/DashboardShell.jsx

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardShell({ navItems }) {
  // Desktop: sidebar collapsed or expanded
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Mobile: sidebar open or closed
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">

      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <TopBar onOpenMobile={() => setIsMobileOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  )
}