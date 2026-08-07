import { useState, useEffect } from 'react'
import { getMyApplicationsWithJobs } from '../../api/jobApi'
import {
  Briefcase, MapPin, Building2, Calendar,
  Loader2, AlertCircle, X, 
  FileClock, Eye, Star, XCircle, ArrowRight
} from 'lucide-react'

const statusConfig = {
  applied:     { 
    label: 'Applied', 
    color: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 ring-1 ring-brand-200/40 dark:ring-brand-800/40',
    icon: FileClock
  },
  reviewed:    { 
    label: 'Reviewed', 
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
    icon: Eye 
  },
  shortlisted: { 
    label: 'Shortlisted', 
    color: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
    icon: Star 
  },
  rejected:    { 
    label: 'Rejected', 
    color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-red-200/40 dark:ring-red-800/40',
    icon: XCircle 
  },
}

const jobTypeLabel = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
}

function JobDetailModal({ app, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {app.job.title}
            </h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                {app.job.company_name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                {app.job.location}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                Applied {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusConfig[app.status]?.color}`}>
                {statusConfig[app.status]?.label}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Job Description
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {app.job.description}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Requirements
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {app.job.requirements}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CandidateApplications() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    getMyApplicationsWithJobs()
      .then(setApplications)
      .catch(() => setError('Failed to load applications'))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter(a => a.status === filterStatus)

  // Count per status
  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            My Applications
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Track your applications across all companies
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Dashboard-style Status Summary Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon
            const isSelected = filterStatus === status
            
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(isSelected ? 'all' : status)}
                className={`relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 dark:border-brand-400 dark:bg-brand-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-1 flex w-full items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {counts[status] ?? 0}
                    </p>
                    <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {config.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mb-1 h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-400" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Active filter indicator */}
        {filterStatus !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing: <span className="font-medium text-slate-700 dark:text-slate-300">{statusConfig[filterStatus]?.label}</span>
            </span>
            <button
              onClick={() => setFilterStatus('all')}
              className="text-xs text-brand-600 hover:underline dark:text-brand-400"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Applications Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Briefcase className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
              No applications found
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {applications.length === 0
                ? 'Start applying to jobs to track them here'
                : `No ${statusConfig[filterStatus]?.label.toLowerCase()} applications found`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(app => (
              <div
                key={app.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Top Badges */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[app.status]?.color}`}>
                    {statusConfig[app.status]?.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    app.job.is_active
                      ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${app.job.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                    {app.job.is_active ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* Job Details */}
                <h3 className="mt-4 line-clamp-1 text-base font-medium text-slate-900 dark:text-white">
                  {app.job.title}
                </h3>
                <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {app.job.company_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {app.job.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Applied {new Date(app.applied_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedApp(app)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  View Job Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <JobDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </>
  )
}