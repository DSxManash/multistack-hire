import {
  LayoutDashboard, User,
  BarChart3, Briefcase, ClipboardList
} from 'lucide-react'
import DashboardShell from '../components/dashboard/DashboardShell'

const candidateNav = [
  { label: 'Dashboard',      path: '/candidate/dashboard',    icon: LayoutDashboard, exact: true },
  { label: 'Browse Jobs',    path: '/candidate/jobs',         icon: Briefcase },
  { label: 'My Applications',path: '/candidate/applications', icon: ClipboardList },
  { label: 'My Profile',     path: '/candidate/profile',      icon: User },
  { label: 'My Ranking',     path: '/candidate/ranking',      icon: BarChart3 },
]

export default function CandidateLayout() {
  return <DashboardShell navItems={candidateNav} />
}