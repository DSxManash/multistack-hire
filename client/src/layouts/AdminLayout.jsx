import {
  LayoutDashboard,
  Users,
  Brain,
} from 'lucide-react'
import DashboardShell from '../components/dashboard/DashboardShell'

const adminNav = [
  { label: 'Dashboard',  path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Users',      path: '/admin/users',     icon: Users },
  { label: 'ML Model',   path: '/admin/model',     icon: Brain },
]

export default function AdminLayout() {
  return <DashboardShell navItems={adminNav} />
}