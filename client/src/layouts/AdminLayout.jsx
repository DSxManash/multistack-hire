import {
  LayoutDashboard,
  Users,
  Brain,
  BarChart3,
} from 'lucide-react'
import DashboardShell from '../components/dashboard/DashboardShell'

const adminNav = [
  { label: 'Dashboard',  path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Users',      path: '/admin/users',     icon: Users },
  { label: 'ML Model',   path: '/admin/model',     icon: Brain },
  { label: 'Analytics',  path: '/admin/analytics', icon: BarChart3 },
]

export default function AdminLayout() {
  return <DashboardShell navItems={adminNav} />
}