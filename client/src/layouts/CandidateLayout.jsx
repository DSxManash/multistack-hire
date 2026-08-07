import {
  LayoutDashboard, User,
  BarChart3, Briefcase,ClipboardList, FileText,Settings
} from 'lucide-react'
import DashboardShell from '../components/dashboard/DashboardShell'

const candidateNav = [
  { label: 'Dashboard',      path: '/candidate/dashboard',    icon: LayoutDashboard, exact: true },
  { label: 'Browse Jobs',    path: '/candidate/jobs',         icon: Briefcase },
  { label: 'My Applications',path: '/candidate/applications', icon: ClipboardList },
  { label: 'My Profile',     path: '/candidate/profile',      icon: User },
  { label: 'Resume',         path: '/candidate/resume',       icon: FileText },
  { label: 'My Ranking',     path: '/candidate/ranking',      icon: BarChart3 },
  { label: 'Settings',       path: '/candidate/settings',     icon: Settings },
]

export default function CandidateLayout() {
  return <DashboardShell navItems={candidateNav} />
}