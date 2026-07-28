import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getCandidateStats, getProfileCompletion } from '../../api/candidateApi'
import {
  User, FileText, BarChart3, Briefcase,
  ArrowRight, Upload, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Circle, Loader2
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
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

function ActivityItem({ text, time, status }) {
  const statusIcon = {
    done:    <CheckCircle2 className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    info:    <Circle className="h-4 w-4 text-brand-500" />,
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
  const [stats, setStats] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCandidateStats(), getProfileCompletion()])
      .then(([statsData, completionData]) => {
        setStats(statsData)
        setCompletion(completionData)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    {
      icon: User,
      label: 'Profile Completion',
      value: completion ? `${completion.percentage}%` : '—',
      sub: completion?.completed
        ? 'Profile complete'
        : `${completion?.missing?.length ?? 0} fields remaining`,
      color: 'brand',
    },
    {
      icon: FileText,
      label: 'Resume Status',
      value: stats?.resume_uploaded ? 'Uploaded' : 'Missing',
      sub: stats?.resume_uploaded
        ? 'Resume on file'
        : 'Upload to get scored',
      color: stats?.resume_uploaded ? 'green' : 'amber',
    },
    {
      icon: BarChart3,
      label: 'Ranking Score',
      value: stats?.ranking_score != null
        ? `${stats.ranking_score}/100`
        : '—',
      sub: stats?.ranking_score != null
        ? 'AI-generated score'
        : 'Upload resume to get scored',
      color: 'purple',
    },
    {
      icon: Briefcase,
      label: 'Jobs Applied',
      value: stats?.jobs_applied ?? '—',
      sub: stats?.jobs_applied === 0
        ? 'Browse open positions'
        : `${stats?.jobs_applied} application${stats?.jobs_applied !== 1 ? 's' : ''}`,
      color: 'amber',
    },
  ]

  const activity = [
    {
      text: 'Account created successfully',
      time: 'Registration complete',
      status: 'done',
    },
    {
      text: stats?.resume_uploaded
        ? 'Resume uploaded successfully'
        : 'Resume not yet uploaded',
      time: stats?.resume_uploaded ? 'On file' : 'Pending action',
      status: stats?.resume_uploaded ? 'done' : 'warning',
    },
    {
      text: completion?.completed
        ? 'Profile completed'
        : 'Profile incomplete',
      time: completion?.completed
        ? 'Ready to apply'
        : `Missing: ${completion?.missing?.slice(0, 2).join(', ')}`,
      status: completion?.completed ? 'done' : 'pending',
    },
    {
      text: stats?.ranking_score != null
        ? `Ranking score: ${stats.ranking_score}/100`
        : 'ML ranking score not generated yet',
      time: stats?.ranking_score != null
        ? 'AI scored'
        : 'Waiting for resume',
      status: stats?.ranking_score != null ? 'done' : 'info',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
     <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-r from-white via-brand-50 to-brand-100 px-6 py-6 shadow-sm dark:border-brand-900 dark:from-slate-900 dark:via-brand-950/40 dark:to-slate-900">
  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-500/10"></div>

  <div className="relative">
    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
      Welcome back, {user?.full_name?.split(' ')[0]} 👋
    </h2>

    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
      {completion?.completed
        ? 'Your profile is complete. Browse jobs and apply!'
        : 'Complete your profile and upload your resume to get your AI-powered ranking score.'}
    </p>
  </div>
</div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Bottom section */}
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
            {[
              {
                to: '/candidate/resume',
                icon: Upload,
                bg: 'bg-brand-50 dark:bg-brand-950',
                iconColor: 'text-brand-600 dark:text-brand-400',
                title: 'Upload Resume',
                sub: 'PDF format, max 5MB',
              },
              {
                to: '/candidate/profile',
                icon: User,
                bg: 'bg-purple-50 dark:bg-purple-950',
                iconColor: 'text-purple-600 dark:text-purple-400',
                title: 'Complete Profile',
                sub: 'Add GitHub & StackOverflow',
              },
              {
                to: '/candidate/jobs',
                icon: Briefcase,
                bg: 'bg-amber-50 dark:bg-amber-950',
                iconColor: 'text-amber-600 dark:text-amber-400',
                title: 'Browse Jobs',
                sub: 'Apply to open positions',
              },
              {
                to: '/candidate/ranking',
                icon: TrendingUp,
                bg: 'bg-green-50 dark:bg-green-950',
                iconColor: 'text-green-600 dark:text-green-400',
                title: 'View My Ranking',
                sub: 'AI-powered score breakdown',
              },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.bg}`}>
                    <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {action.sub}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hiring section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Open Positions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest job postings from recruiters
            </p>
          </div>
          <Link
            to="/candidate/jobs"
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-500"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
          <Briefcase className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {stats?.jobs_applied > 0
              ? `You have applied to ${stats.jobs_applied} job${stats.jobs_applied !== 1 ? 's' : ''}`
              : 'No applications yet'
            }
          </p>
          <Link
            to="/candidate/jobs"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700"
          >
            Browse Jobs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}