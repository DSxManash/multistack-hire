import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  User, FileText, BarChart3, Briefcase,
  ArrowRight, Upload, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Circle
} from 'lucide-react'



// Reusable stat card matching your design system
function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  )
}

// Recent activity item
function ActivityItem({ icon: Icon, text, time, status }) {
  const statusIcon = {
    done: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    info: <Circle className="h-4 w-4 text-brand-500" />,
    warning: <AlertCircle className="h-4 w-4 text-red-400" />,
  }
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 shrink-0">{statusIcon[status]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

export default function CandidateDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      icon: User,
      label: 'Profile Completion',
      value: '75%',
      sub: 'Add GitHub link to complete',
      color: 'brand',
    },
    {
      icon: FileText,
      label: 'Resume Status',
      value: 'Uploaded',
      sub: 'Last updated 2 days ago',
      color: 'green',
    },
    {
      icon: BarChart3,
      label: 'Ranking Score',
      value: '—',
      sub: 'Upload resume to get scored',
      color: 'purple',
    },
    {
      icon: Briefcase,
      label: 'Jobs Applied',
      value: '0',
      sub: 'Browse open positions',
      color: 'amber',
    },
  ]

  const activity = [
    { text: 'Account created successfully', time: 'Just now', status: 'done' },
    { text: 'Resume not yet uploaded', time: 'Pending action', status: 'warning' },
    { text: 'GitHub profile not linked', time: 'Pending action', status: 'pending' },
    { text: 'ML ranking score not generated yet', time: 'Waiting for resume', status: 'info' },
  ]

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ─────────────────────────────── */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 px-6 py-5 dark:border-brand-900 dark:bg-brand-950/30">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Complete your profile and upload your resume to get your AI-powered ranking score.
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Bottom section ─────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Recent Activity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Your latest actions and updates
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activity.map((a, i) => (
              <ActivityItem key={i} {...a} />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Complete these steps to improve your ranking
          </p>
          <div className="space-y-3">
            <Link
              to="/candidate/resume"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                  <Upload className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Upload Resume</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PDF format, max 5MB</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/candidate/profile"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                  <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Complete Profile</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add GitHub & StackOverflow</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/candidate/ranking"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">View My Ranking</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI-powered score breakdown</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}