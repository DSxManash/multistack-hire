import {
  LayoutDashboard, Briefcase, Building2,
  Search, Bookmark, BarChart3,
} from 'lucide-react'
import DashboardShell from '../components/dashboard/DashboardShell'

const recruiterNav = [
  { label: 'Dashboard',  path: '/recruiter/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Company',    path: '/recruiter/company',   icon: Building2 },
  { label: 'Jobs',       path: '/recruiter/jobs',      icon: Briefcase },
  { label: 'Search',     path: '/recruiter/search',    icon: Search },
  { label: 'Shortlist',  path: '/recruiter/shortlist', icon: Bookmark },
  { label: 'Analytics',  path: '/recruiter/analytics', icon: BarChart3 },
]

export default function RecruiterLayout() {
  return <DashboardShell navItems={recruiterNav} />
}