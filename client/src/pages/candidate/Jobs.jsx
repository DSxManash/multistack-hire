import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { browseJobs, applyToJob, getMyApplications } from '../../api/jobApi'
import { getProfileCompletion } from '../../api/candidateApi'
import {
  Briefcase, MapPin, Clock, Building2,
  CheckCircle2, Loader2, AlertCircle,
  Search, ArrowRight, ShieldAlert
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

// Skeleton card component
function JobSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between">
        <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
      <div className="mt-3 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="mt-1 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="mt-1 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="mt-4 h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </div>
  )
}

export default function CandidateJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [applying, setApplying] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [successMsg, setSuccessMsg] = useState(null)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [profileMissing, setProfileMissing] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [jobsData, appsData, completionData] = await Promise.all([
          browseJobs(),
          getMyApplications(),
          getProfileCompletion(),
        ])
        setJobs(jobsData)
        setAppliedIds(new Set(appsData.map((a) => a.job_id)))
        setProfileCompleted(completionData.completed)
        setProfileMissing(completionData.missing)
      } catch {
        setError('Failed to load jobs. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  async function handleApply(jobId) {
    if (!profileCompleted) {
      navigate('/candidate/profile', {
        state: {
          fromApply: true,
          missing: profileMissing,
        }
      })
      return
    }
    setApplying(jobId)
    setSuccessMsg(null)
    setError(null)
    try {
      await applyToJob(jobId)
      setAppliedIds((prev) => new Set([...prev, jobId]))
      setSuccessMsg('Application submitted successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply.')
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

  // Skeleton loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="mt-1 h-5 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="relative">
          <div className="h-11 w-full rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Browse Jobs
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {jobs.length} open position{jobs.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {!profileCompleted && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/30">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Complete your profile to apply for jobs
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              Missing: {profileMissing.join(', ')}
            </p>
            <button
              onClick={() => navigate('/candidate/profile')}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Complete Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400 animate-slideDown">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 animate-slideDown">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, company, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-950">
          <Briefcase className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            {search ? 'No jobs match your search' : 'No jobs available yet'}
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
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-brand-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${jobTypeColor[job.job_type]}`}>
                    {jobTypeLabel[job.job_type]}
                  </span>
                  {hasApplied && (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 animate-bounceOnce dark:bg-green-950 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Applied
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
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
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(job.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={hasApplied || isApplying}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    hasApplied
                      ? 'cursor-default bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                      : !profileCompleted
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow hover:shadow-md hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60'
                  }`}
                >
                  {isApplying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {hasApplied
                    ? 'Applied'
                    : !profileCompleted
                    ? 'Complete Profile to Apply'
                    : isApplying
                    ? 'Applying...'
                    : 'Apply Now'
                  }
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}