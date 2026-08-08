// client/src/pages/candidate/Jobs.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { browseJobs, applyToJob, getMyApplications } from '../../api/jobApi'
import { getProfileCompletion } from '../../api/candidateApi'
import {
  Briefcase, MapPin, Clock, Building2,
  CheckCircle2, Loader2, AlertCircle,
  Search, ArrowRight, ShieldAlert, X,
  Filter, Calendar, ChevronDown
} from 'lucide-react'

const jobTypeLabel = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
}

const jobTypeColor = {
  full_time:  'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 ring-1 ring-brand-200/40 dark:ring-brand-800/40',
  part_time:  'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 ring-1 ring-purple-200/40 dark:ring-purple-800/40',
  contract:   'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
  internship: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
}

// ── Deadline Helper ──────────────────────────────────────────────
function getDeadlineStatus(deadlineStr) {
  if (!deadlineStr) return null
  const now = new Date()
  const deadline = new Date(deadlineStr)
  const diffMs = deadline - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { 
      label: 'Closed', 
      color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-red-200/40 dark:ring-red-800/40',
      icon: X 
    }
  }
  if (diffDays === 0) {
    return { 
      label: 'Closes today', 
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
      icon: AlertCircle 
    }
  }
  if (diffDays === 1) {
    return { 
      label: 'Closes tomorrow', 
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
      icon: AlertCircle 
    }
  }
  if (diffDays <= 7) {
    return { 
      label: `${diffDays} days left`, 
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
      icon: Clock 
    }
  }
  return { 
    label: `${diffDays} days left`, 
    color: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
    icon: Clock 
  }
}

// ── Job Detail Modal ─────────────────────────────────────────────
function JobDetailModal({ job, hasApplied, isApplying, onApply, onClose }) {
  const deadlineStatus = getDeadlineStatus(job.application_deadline)
  const deadlineDate = job.application_deadline 
    ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {job.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {job.company_name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            {/* Modal Deadline Display */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${jobTypeColor[job.job_type]}`}>
                {jobTypeLabel[job.job_type]}
              </span>
              {deadlineStatus && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${deadlineStatus.color}`}>
                  <deadlineStatus.icon className="h-3.5 w-3.5" />
                  Apply by: {deadlineDate} ({deadlineStatus.label})
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Job Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Requirements</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>

          {job.is_active && (
            <button
              onClick={() => onApply(job.id)}
              disabled={hasApplied || isApplying}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                hasApplied
                  ? 'cursor-default bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60'
              }`}
            >
              {isApplying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {hasApplied
                ? <><CheckCircle2 className="h-3.5 w-3.5" /> Applied</>
                : isApplying ? 'Applying...' : 'Apply Now'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function CandidateJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [applying, setApplying] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [profileMissing, setProfileMissing] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('open')
  const [sortBy, setSortBy] = useState('newest') // Added 'deadline' option
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [jobsData, appsData, completionData] = await Promise.all([
          browseJobs(),
          getMyApplications(),
          getProfileCompletion(),
        ])
        setJobs(jobsData)
        setAppliedIds(new Set(appsData.map(a => a.job_id)))
        setProfileCompleted(completionData.completed)
        setProfileMissing(completionData.missing)
      } catch {
        setError('Failed to load jobs.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  async function handleApply(jobId) {
    if (!profileCompleted) {
      navigate('/candidate/profile', {
        state: { fromApply: true, missing: profileMissing }
      })
      return
    }
    setApplying(jobId)
    setSuccessMsg(null)
    setError(null)
    try {
      await applyToJob(jobId)
      setAppliedIds(prev => new Set([...prev, jobId]))
      setSuccessMsg('Application submitted successfully!')
      if (selectedJob?.id === jobId) {
        setSelectedJob(prev => ({ ...prev }))
      }
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setApplying(null)
    }
  }

  // Apply filters
  let filtered = [...jobs]

  // Search
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    )
  }

  // Job type filter
  if (filterType !== 'all') {
    filtered = filtered.filter(j => j.job_type === filterType)
  }

  // Status filter
  if (filterStatus === 'open') {
    filtered = filtered.filter(j => j.is_active)
  } else if (filterStatus === 'closed') {
    filtered = filtered.filter(j => !j.is_active)
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at)
    }
    if (sortBy === 'deadline') {
      // Sort by soonest deadline first
      return new Date(a.application_deadline || Infinity) - new Date(b.application_deadline || Infinity)
    }
    return 0
  })

  const activeFiltersCount = [
    filterType !== 'all',
    filterStatus !== 'all',
    sortBy !== 'newest',
  ].filter(Boolean).length

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Browse Jobs
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {filtered.length} of {jobs.length} position{jobs.length !== 1 ? 's' : ''} shown
            </p>
          </div>
          <button
            onClick={() => navigate('/candidate/applications')}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Briefcase className="h-4 w-4" />
            My Applications
            {appliedIds.size > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">
                {appliedIds.size}
              </span>
            )}
          </button>
        </div>

        {/* Profile incomplete warning */}
        {!profileCompleted && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Complete your profile to apply for jobs
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                Missing: {profileMissing.join(', ')}
              </p>
              <button
                onClick={() => navigate('/candidate/profile')}
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Complete Profile <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Success / Error */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Search + Filter bar */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by title, company, or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Job Type
                </label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Job Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="deadline">Closing Soonest</option>
                </select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterType('all')
                      setFilterStatus('open')
                      setSortBy('newest')
                    }}
                    className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job list */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Briefcase className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
              No jobs match your filters
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search or filters
            </p>
            {(search || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearch('')
                  setFilterType('all')
                  setFilterStatus('open')
                  setSortBy('newest')
                }}
                className="mt-3 text-xs text-brand-600 hover:underline dark:text-brand-400"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(job => {
              const hasApplied = appliedIds.has(job.id)
              const isApplying = applying === job.id
              const deadlineStatus = getDeadlineStatus(job.application_deadline)

              return (
                <div
                  key={job.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${jobTypeColor[job.job_type]}`}>
                      {jobTypeLabel[job.job_type]}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {hasApplied && (
                        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40">
                          <CheckCircle2 className="h-3 w-3" />
                          Applied
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        job.is_active
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {job.is_active ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  {/* Title + meta */}
                  <h3 className="mt-4 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 className="h-3.5 w-3.5" />
                    {job.company_name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </div>
                  
                  {/* Dates Row */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(job.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                    
                    {/* Application Deadline Badge */}
                    {deadlineStatus && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${deadlineStatus.color}`}>
                        <deadlineStatus.icon className="h-3.5 w-3.5" />
                        {deadlineStatus.label}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      View Details
                    </button>

                    {job.is_active && (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={hasApplied || isApplying}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                          hasApplied
                            ? 'cursor-default bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40'
                            : !profileCompleted
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40'
                            : 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60'
                        }`}
                      >
                        {isApplying && <Loader2 className="h-3 w-3 animate-spin" />}
                        {hasApplied
                          ? 'Applied'
                          : !profileCompleted
                          ? 'Complete Profile'
                          : isApplying
                          ? 'Applying...'
                          : 'Apply Now'
                        }
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Job detail modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          hasApplied={appliedIds.has(selectedJob.id)}
          isApplying={applying === selectedJob.id}
          onApply={handleApply}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  )
}