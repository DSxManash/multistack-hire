// client/src/pages/admin/SystemAnalytics.jsx

import { useState, useEffect } from 'react'
import { getAdminStats, getAllUsers } from '../../api/adminApi'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart,
  Pie, Cell, Legend
} from 'recharts'
import {
  Users, Briefcase, BarChart3, Brain,
  Loader2, ShieldCheck, UserCheck
} from 'lucide-react'

export default function SystemAnalytics() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers()])
      .then(([statsData, usersData]) => {
        setStats(statsData)
        setUsers(usersData)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  // Role distribution for pie chart
  const roleData = [
    {
      name: 'Candidates',
      value: stats?.total_candidates ?? 0,
      color: '#22c55e',
    },
    {
      name: 'Recruiters',
      value: stats?.total_recruiters ?? 0,
      color: '#2563eb',
    },
    {
      name: 'Admins',
      value: (stats?.total_users ?? 0) - (stats?.total_candidates ?? 0) - (stats?.total_recruiters ?? 0),
      color: '#ef4444',
    },
  ].filter(d => d.value > 0)

  // Monthly registrations (last 6 months)
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const month = date.toLocaleString('default', { month: 'short' })
    const count = users.filter(u => {
      const joined = new Date(u.created_at)
      return joined.getMonth() === date.getMonth() &&
             joined.getFullYear() === date.getFullYear()
    }).length
    return { month, users: count }
  })

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.total_users ?? 0,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950',
    },
    {
      icon: UserCheck,
      label: 'Candidates',
      value: stats?.total_candidates ?? 0,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      icon: Briefcase,
      label: 'Recruiters',
      value: stats?.total_recruiters ?? 0,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: Brain,
      label: 'Rankings Generated',
      value: stats?.rankings_generated ?? 0,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          System Analytics
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Platform-wide usage statistics
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              {s.value}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Monthly registrations */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Monthly Registrations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            New users over the last 6 months
          </p>
          <ResponsiveContainer width="100%" height={200}>
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
              <Bar dataKey="users" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            User Role Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Breakdown of registered users by role
          </p>
          {roleData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-400">No users yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
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
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* System health */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          System Health
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'FastAPI Backend',     status: 'operational', note: 'Running on port 8000' },
            { label: 'PostgreSQL Database', status: 'operational', note: 'Connected via asyncpg' },
            { label: 'MinIO Storage',       status: 'operational', note: 'Resume storage active' },
            { label: 'ML Pipeline',         status: 'pending',     note: 'Integration in progress' },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className={`h-4 w-4 shrink-0 ${
                  s.status === 'operational'
                    ? 'text-green-500'
                    : 'text-amber-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-400">{s.note}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                s.status === 'operational'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
              }`}>
                {s.status === 'operational' ? 'Online' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}