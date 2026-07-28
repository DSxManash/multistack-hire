import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  Users,
  Brain,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

import { getAdminStats } from '../../api/adminApi'

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
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

export default function AdminDashboard() {
  const { user } = useAuth()
  const [adminStats, setAdminStats] = useState(null)

  useEffect(() => {
  getAdminStats()
    .then(setAdminStats)
    .catch(() => {})
}, [])


// Update stats array:
const stats = [
  {
    icon: Users,
    label: 'Total Users',
    value: adminStats?.total_users ?? '—',
    sub: `${adminStats?.total_candidates ?? 0} candidates, ${adminStats?.total_recruiters ?? 0} recruiters`,
    color: 'brand',
  },
  {
    icon: Brain,
    label: 'Model Status',
    value: 'Not trained',
    sub: 'No model deployed yet',
    color: 'purple',
  },
  {
    icon: BarChart3,
    label: 'Rankings Generated',
    value: adminStats?.rankings_generated ?? '—',
    sub: 'Candidates scored',
    color: 'green',
  },
  {
    icon: ShieldCheck,
    label: 'System Health',
    value: 'Good',
    sub: 'All services running',
    color: 'amber',
  },
]

  const systemStatus = [
    { label: 'FastAPI Backend',    status: 'operational', note: 'Running on port 8000'   },
    { label: 'PostgreSQL Database',status: 'operational', note: 'Connected via asyncpg'  },
    { label: 'ML Model',           status: 'warning',     note: 'Not yet trained'         },
    { label: 'MinIO Storage',      status: 'warning',     note: 'Not yet configured'      },
  ]

  const actions = [
    {
      to: '/admin/users',
      icon: Users,
      iconBg: 'bg-brand-50 dark:bg-brand-950',
      iconColor: 'text-brand-600 dark:text-brand-400',
      title: 'Manage Users',
      sub: 'View, activate, deactivate, delete, change roles',
    },
    {
      to: '/admin/model',
      icon: Brain,
      iconBg: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'ML Model',
      sub: 'View model status and retrain',
    },
    {
      to: '/admin/analytics',
      icon: BarChart3,
      iconBg: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'System Analytics',
      sub: 'Usage stats and rankings overview',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-5 dark:border-red-900 dark:bg-red-950/20">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Admin Panel — {user?.full_name} 🛡️
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage users, monitor the ML model, and oversee system health from here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Bottom */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* System status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">System Status</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Live service health</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {systemStatus.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {s.status === 'operational'
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  }
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.note}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  s.status === 'operational'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                }`}>
                  {s.status === 'operational' ? 'Online' : 'Warning'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Admin Actions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Jump to admin tools</p>
          <div className="space-y-3">
            {actions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
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
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}