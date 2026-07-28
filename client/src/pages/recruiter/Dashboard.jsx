import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  Users, Search, Bookmark, TrendingUp,
  ArrowRight, Star, Clock, CheckCircle2,
  Building2, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyCompany } from '../../api/companyApi'

import { getRecruiterDashboardStats } from '../../api/jobApi'

// ── Stat Card ──────────────────────────────────────────────────
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

// ── Company Registration Popup ──────────────────────────────
function CompanyRegistrationPopup({ onRegister, onDismiss }) {
  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">

        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 mb-4">
          <Building2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>

        {/* Content */}
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Register Your Company
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          To start posting jobs and finding candidates, please register your company profile first.
        </p>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={onRegister}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Register Now
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onDismiss}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function RecruiterDashboard() {
const { user } = useAuth()
const navigate = useNavigate()

const [showCompanyPopup, setShowCompanyPopup] = useState(false)
const [dashStats, setDashStats] = useState(null)

  // Check if company exists – only once per session
  useEffect(() => {
  const dismissed = sessionStorage.getItem('company_popup_dismissed')
  if (dismissed) return

  getMyCompany()
    .then(company => {
      if (!company) {
        setShowCompanyPopup(true)
      }
    })
    .catch(() => {
      // Silent fail – don't block dashboard
    })

  getRecruiterDashboardStats()
    .then(setDashStats)
    .catch(() => {
      // Silent fail
    })
}, [])


  function handleRegisterNow() {
    setShowCompanyPopup(false)
    navigate('/recruiter/company')
  }

  function handleDismiss() {
    sessionStorage.setItem('company_popup_dismissed', 'true')
    setShowCompanyPopup(false)
  }

  // ── Dashboard data ──────────────────────────────────────────
 const stats = [
  {
    icon: Users,
    label: 'Total Candidates',
    value: dashStats?.total_candidates ?? '—',
    sub: 'In the system',
    color: 'brand',
  },
  {
    icon: Search,
    label: 'Searches Done',
    value: '—',
    sub: 'This session',
    color: 'purple',
  },
  {
    icon: Bookmark,
    label: 'Shortlisted',
    value: dashStats?.shortlisted ?? '—',
    sub: 'Saved candidates',
    color: 'amber',
  },
  {
    icon: TrendingUp,
    label: 'Avg Score',
    value:
      dashStats?.avg_score != null
        ? `${dashStats.avg_score}/100`
        : '—',
    sub: 'Across shortlisted',
    color: 'green',
  },
]

  const actions = [
    {
      to: '/recruiter/search',
      icon: Search,
      iconBg: 'bg-brand-50 dark:bg-brand-950',
      iconColor: 'text-brand-600 dark:text-brand-400',
      title: 'Search Candidates',
      sub: 'Filter by skills, score, role',
    },
    {
      to: '/recruiter/shortlist',
      icon: Bookmark,
      iconBg: 'bg-amber-50 dark:bg-amber-950',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'View Shortlist',
      sub: 'Review saved candidates',
    },
    {
      to: '/recruiter/analytics',
      icon: TrendingUp,
      iconBg: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Analytics',
      sub: 'Ranking distribution charts',
    },
  ]

  const recentActivity = [
    { text: 'Account created successfully',       time: 'Just now',    status: 'done'    },
    { text: 'No candidates searched yet',         time: 'Pending',     status: 'pending' },
    { text: 'Shortlist is empty',                 time: 'Add candidates', status: 'info' },
  ]

  return (
    <>
      {/* Popup */}
      {showCompanyPopup && (
        <CompanyRegistrationPopup
          onRegister={handleRegisterNow}
          onDismiss={handleDismiss}
        />
      )}

      {/* Main dashboard */}
      <div className="space-y-6">

        {/* Welcome banner */}
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-6 py-5 dark:border-brand-900 dark:bg-brand-950/30">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Welcome, {user?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Search and rank technical candidates using AI-powered evaluation scores.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Bottom section */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Your latest recruiter actions
            </p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <div className="mt-0.5 shrink-0">
                    {a.status === 'done'    && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {a.status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}
                    {a.status === 'info'    && <Star className="h-4 w-4 text-brand-500" />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{a.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Quick Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Jump to key recruiter tools
            </p>
            <div className="space-y-3">
              {actions.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.iconBg}`}>
                      <a.icon className={`h-4 w-4 ${a.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.sub}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}