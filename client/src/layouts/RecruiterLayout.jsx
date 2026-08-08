import {
  LayoutDashboard, Briefcase, Building2,
  Bookmark,
} from 'lucide-react'
import DashboardShell from '../components/dashboard/DashboardShell'

const recruiterNav = [
  { label: 'Dashboard',  path: '/recruiter/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Company',    path: '/recruiter/company',   icon: Building2 },
  { label: 'Jobs',       path: '/recruiter/jobs',      icon: Briefcase },
  { label: 'Shortlisted', path: '/recruiter/shortlistd', icon: Bookmark },
]

export default function RecruiterLayout() {
  return <DashboardShell navItems={recruiterNav} />
}