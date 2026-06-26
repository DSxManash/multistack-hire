
import { useState, useEffect } from 'react'
import { browseJobs, applyToJob, getMyApplications } from '../../api/jobApi'
import {
  Briefcase, MapPin, Clock, Building2,
  CheckCircle2, Loader2, AlertCircle, Search
} from 'lucide-react'

const jobTypeLabel = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
}

const jobTypeColor = {
  full_time:  'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  part_time:  'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  contract:   'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  internship: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
}

export default function CandidateJobs() {
  const [jobs, setJobs] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [applying, setApplying] = useState(null) // job id currently being applied to
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [jobsData, appsData] = await Promise.all([
          browseJobs(),
          getMyApplications(),
        ])
        setJobs(jobsData)
        // Build a Set of job IDs the candidate already applied to
        setAppliedIds(new Set(appsData.map((a) => a.job_id)))
      } catch {
        setError('Failed to load jobs. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  async function handleApply(jobId) {
    setApplying(jobId)
    setSuccessMsg(null)
    try {
      await applyToJob(jobId)
      setAppliedIds((prev) => new Set([...prev, jobId]))
      setSuccessMsg('Application submitted successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply. Please try again.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setApplying(null)
    }
  }

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company_name.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Browse Jobs
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {jobs.length} open position{jobs.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Success / Error toasts */}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, company, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-950">
          <Briefcase className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            {search ? 'No jobs match your search' : 'No jobs available yet'}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {search ? 'Try a different keyword' : 'Check back soon for new postings'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => {
            const hasApplied = appliedIds.has(job.id)
            const isApplying = applying === job.id

            return (
              <div
                key={job.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                {/* Job type badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${jobTypeColor[job.job_type]}`}>
                    {jobTypeLabel[job.job_type]}
                  </span>
                  {hasApplied && (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Applied
                    </span>
                  )}
                </div>

                {/* Title + company */}
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
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

                {/* Posted date */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(job.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>

                {/* Apply button */}
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={hasApplied || isApplying}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    hasApplied
                      ? 'cursor-default bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                      : 'bg-brand-600 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60'
                  }`}
                >
                  {isApplying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {hasApplied ? 'Applied' : isApplying ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}