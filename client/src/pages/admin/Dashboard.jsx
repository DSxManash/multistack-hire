// client/src/pages/admin/AdminDashboard.jsx

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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import { getAdminStats, getAllUsers } from '../../api/adminApi'
import { fetchHealth, fetchHealthDb } from '../../api/healthApi'

// ── Stat Card (Horizontal Dashboard Style) ──────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  }
  return (
    <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [adminStats, setAdminStats] = useState(null)
  const [users, setUsers] = useState([])
  const [health, setHealth] = useState({ api: 'checking', db: 'checking' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getAllUsers(),
      fetchHealth().then(() => 'operational').catch(() => 'error'),
      fetchHealthDb().then(() => 'operational').catch(() => 'error'),
    ])
      .then(([statsData, usersData, apiStatus, dbStatus]) => {
        setAdminStats(statsData)
        setUsers(usersData)
        setHealth({ api: apiStatus, db: dbStatus })
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <ArrowRight className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  // System status configuration using your dashboard's standard badge styling
  const statusBadgeStyles = {
    operational: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
  }

  const safeUsers = users ?? []

  const roleData = [
    {
      name: 'Candidates',
      value: adminStats?.total_candidates ?? 0,
      color: '#22c55e',
    },
    {
      name: 'Recruiters',
      value: adminStats?.total_recruiters ?? 0,
      color: '#2563eb',
    },
    {
      name: 'Admins',
      value: Math.max((adminStats?.total_users ?? 0) - (adminStats?.total_candidates ?? 0) - (adminStats?.total_recruiters ?? 0), 0),
      color: '#ef4444',
    },
  ].filter(entry => entry.value > 0)

  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const month = date.toLocaleString('default', { month: 'short' })
    const count = safeUsers.filter((user) => {
      const joined = new Date(user.created_at)
      return joined.getMonth() === date.getMonth() && joined.getFullYear() === date.getFullYear()
    }).length
    return { month, users: count }
  })

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
    {
      label: 'FastAPI Backend',
      status: health.api,
      note: health.api === 'operational' ? 'Responding to /health' : 'Health check failed',
    },
    {
      label: 'PostgreSQL Database',
      status: health.db,
      note: health.db === 'operational' ? 'Connected via asyncpg' : 'Database unreachable',
    },
    {
      label: 'ML Model',
      status: adminStats?.model_trained ? 'operational' : 'warning',
      note: adminStats?.model_trained ? 'Model deployed' : 'Not yet trained',
    },
    {
      label: 'MinIO Storage',
      status: 'pending',
      note: 'Resume storage (not health-checked)',
    },
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
  ]

  return (
    <div className="space-y-6">

      {/* Welcome Banner - Changed to standard brand colors, not warning red */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Admin Panel — {user?.full_name} 
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-red-200/40 dark:ring-red-800/40">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </span>
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage users, monitor the ML model, and oversee system health from here.
        </p>
      </div>

      {/* Dashboard Metrics - Horizontal grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Monthly registrations */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Monthly Registrations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">New users over the last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="users" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">User Role Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Breakdown of registered users by role</p>
          {roleData.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-slate-400">No user data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={value => (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* System Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">System Status</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Live service health</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {systemStatus.map((s, i) => {
              const isOperational = s.status === 'operational'
              return (
                <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {isOperational
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{s.note}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeStyles[s.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isOperational ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {isOperational ? 'Online' : 'Warning'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Admin Actions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Jump to admin tools</p>
          <div className="space-y-3">
            {actions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-brand-700 dark:hover:bg-slate-800/50"
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
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}