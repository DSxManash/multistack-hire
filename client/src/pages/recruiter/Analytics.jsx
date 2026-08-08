// client/src/pages/recruiter/Analytics.jsx

import { useState, useEffect } from 'react'
import { getRecruiterAnalytics } from '../../api/jobApi'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from 'recharts'
import {
  Briefcase, Users, TrendingUp, XCircle,
  Loader2, AlertCircle
} from 'lucide-react'

// Pie chart colors matching your design system
const STATUS_COLORS = {
  applied:     '#3b82f6',  // brand-500
  reviewed:    '#f59e0b',  // amber-500
  shortlisted: '#22c55e',  // green-500
  rejected:    '#ef4444',  // red-500
}

// Reusable stat card
function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
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

// Custom tooltip for bar chart
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
        {label}
      </p>
      <p className="text-xs text-brand-600 dark:text-brand-400">
        {payload[0].value} application{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function RecruiterAnalytics() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getRecruiterAnalytics()
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    )
  }

  // Prepare pie chart data
  const pieData = Object.entries(data.status_breakdown)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status],
    }))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recruitment Analytics
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Overview of your hiring activity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Total Jobs Posted"
          value={data.total_jobs}
          sub={`${data.active_jobs} active, ${data.closed_jobs} closed`}
          color="brand"
        />
        <StatCard
          icon={Users}
          label="Total Applications"
          value={data.total_applications}
          sub="Across all your jobs"
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Shortlist Rate"
          value={`${data.shortlist_rate}%`}
          sub={`${data.status_breakdown.shortlisted} shortlisted`}
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="Rejection Rate"
          value={`${data.rejection_rate}%`}
          sub={`${data.status_breakdown.rejected} rejected`}
          color="red"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Bar chart — Applications per job */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Applications per Job
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Top 10 job postings by application count
          </p>

          {data.apps_per_job.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-400">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.apps_per_job}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="job"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="applications"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — Status breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Application Status Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribution across all application stages
          </p>

          {pieData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-400">No applications yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
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

      {/* Status breakdown table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Status Summary
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data.status_breakdown).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-sm capitalize text-slate-700 dark:text-slate-300">
                  {status}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}