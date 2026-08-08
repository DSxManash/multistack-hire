import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  Briefcase, Users, XCircle,
  ArrowRight, Bookmark, AlertCircle, Loader2,
  Building2, Activity, CheckCircle2, Eye
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyCompany } from '../../api/companyApi'
import { getRecruiterAnalytics } from '../../api/jobApi'
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid
} from 'recharts'

// Pie chart colors matching your design system
const STATUS_COLORS = {
  applied:     '#3b82f6',  // brand-500
  reviewed:    '#f59e0b',  // amber-500
  shortlisted: '#22c55e',  // green-500
  rejected:    '#ef4444',  // red-500
}

// ── Company Registration Popup ──────────────────────────────
function CompanyRegistrationPopup({ onRegister, onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 mb-4">
          <Building2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Register Your Company
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          To start posting jobs and finding candidates, please register your company profile first.
        </p>
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

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
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

// ── Main Dashboard ─────────────────────────────────────────────
export default function RecruiterDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [showCompanyPopup, setShowCompanyPopup] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('company_popup_dismissed')
    if (dismissed === null) {
      getMyCompany()
        .then(company => {
          if (!company) {
            setShowCompanyPopup(true)
          }
        })
        .catch(() => {})
    }

    getRecruiterAnalytics()
      .then(setAnalyticsData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setIsLoading(false))
  }, [])

  function handleRegisterNow() {
    setShowCompanyPopup(false)
    navigate('/recruiter/company')
  }

  function handleDismiss() {
    sessionStorage.setItem('company_popup_dismissed', 'true')
    setShowCompanyPopup(false)
  }

  // Prepare pie chart data
  const pieData = analyticsData
    ? Object.entries(analyticsData.status_breakdown)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          color: STATUS_COLORS[status],
        }))
    : []

  // The backend sends apps_per_job, containing "job" and "applications"
  const jobsData = analyticsData?.apps_per_job ?? []

  return (
    <>
      {showCompanyPopup && (
        <CompanyRegistrationPopup
          onRegister={handleRegisterNow}
          onDismiss={handleDismiss}
        />
      )}

      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Welcome, {user?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Recruitment Analytics overview of your hiring activity
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Analytics Stats */}
        {analyticsData && (
          <>
            {/* Key Metrics - 4 cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Briefcase}
                label="Total Jobs Posted"
                value={analyticsData.total_jobs}
                sub={`${analyticsData.active_jobs} active, ${analyticsData.closed_jobs} closed`}
                color="brand"
              />
              <StatCard
                icon={Users}
                label="Total Applications"
                value={analyticsData.total_applications}
                sub={`${analyticsData.avg_applications_per_job ?? 0} avg per job`}
                color="amber"
              />
              <StatCard
                icon={CheckCircle2}
                label="Shortlist Rate"
                value={`${analyticsData.shortlist_rate}%`}
                sub={`${analyticsData.status_breakdown.shortlisted} shortlisted`}
                color="green"
              />
              <StatCard
                icon={XCircle}
                label="Rejection Rate"
                value={`${analyticsData.rejection_rate}%`}
                sub={`${analyticsData.status_breakdown.rejected} rejected`}
                color="red"
              />
            </div>

            {/* Recent Applications */}
            {analyticsData?.recent_applications && analyticsData.recent_applications.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  Recent Applications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Latest applications across your jobs
                </p>
                <div className="space-y-3">
                  {analyticsData.recent_applications.map((app) => {
                    const statusColors = {
                      applied: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
                      reviewed: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                      shortlisted: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
                      rejected: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
                    }
                    const createdDate = app.created_at ? new Date(app.created_at) : new Date()
                    const now = new Date()
                    const diffMs = now.getTime() - createdDate.getTime()
                    const diffMins = Math.floor(diffMs / 60000)
                    const timeString = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`

                    return (
                      <div key={app.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{app.job_title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{timeString}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[app.status] || 'bg-slate-100 text-slate-700'}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid gap-5 lg:grid-cols-2">
              
              {/* Applications per Job Chart - PROFESSIONALLY POLISHED */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 min-h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  Applications per Job
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Top job postings by application count
                </p>

                {jobsData.length > 0 ? (
                  <div className="flex-1 w-full min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={jobsData.slice(0, 10)}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="4 4" 
                          stroke="#e2e8f0" 
                          vertical={false} 
                        />
                        <XAxis
                          dataKey="job"
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                          height={70}
                          tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} 
                          axisLine={false} 
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                            backgroundColor: '#fff',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value) => [value, 'Applications']}
                        />
                        <Bar 
                          dataKey="applications" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 py-12">
                    <p className="text-sm text-slate-400">No job data available</p>
                  </div>
                )}
              </div>

              {/* Application Status Breakdown Chart */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 min-h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  Application Status Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Distribution across all application stages
                </p>

                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 py-12">
                    <p className="text-sm text-slate-400">No applications yet</p>
                  </div>
                ) : (
                  <div className="flex-1 w-full min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
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
                          formatter={(value) => value}
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          verticalAlign="bottom"
                          formatter={(value) => (
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Quick Actions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Jump to key recruiter tools
              </p>
              <div className="space-y-3">
                <Link
                  to="/recruiter/shortlistd"
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-brand-700 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                      <Bookmark className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        View Shortlisted
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Review saved candidates
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}