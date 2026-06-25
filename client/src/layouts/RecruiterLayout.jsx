import {
  LayoutDashboard,
  Search,
  Bookmark,
  BarChart3,
} from 'lucide-react'
import DashboardShell from '../components/dashboard/DashboardShell'

const recruiterNav = [
  { label: 'Dashboard',  path: '/recruiter/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Search',     path: '/recruiter/search',    icon: Search },
  { label: 'Shortlist',  path: '/recruiter/shortlist', icon: Bookmark },
  { label: 'Analytics',  path: '/recruiter/analytics', icon: BarChart3 },
]

export default function RecruiterLayout() {
  return <DashboardShell navItems={recruiterNav} />
}