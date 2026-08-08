
import { useState, useEffect } from 'react'
import { getShortlisted, updateApplicationStatus } from '../../api/jobApi'
import {
  Bookmark, Building2, MapPin, Calendar,
  Mail, Loader2, CheckCircle2, X
} from 'lucide-react'

export default function RecruiterShortlist() {
  const [shortlisted, setShortlisted] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    getShortlisted()
      .then(setShortlisted)
      .finally(() => setIsLoading(false))
  }, [])

  async function handleReject(applicationId) {
    setUpdatingId(applicationId)
    try {
      await updateApplicationStatus(applicationId, 'rejected')
      // Remove from shortlist immediately — no longer shortlisted
      setShortlisted(prev => prev.filter(a => a.id !== applicationId))
      setSuccessMsg('Candidate removed from shortlist')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch {
      // silent
    } finally {
      setUpdatingId(null)
    }
  }

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
          Shortlisted Candidates
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {shortlisted.length} candidate{shortlisted.length !== 1 ? 's' : ''} shortlisted
        </p>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Empty state */}
      {shortlisted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-950">
          <Bookmark className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            No shortlisted candidates yet
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Go to Job Postings → View Applications → Shortlist candidates
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shortlisted.map((app) => (
            <div
              key={app.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
            >
              {/* Shortlisted badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                  ✓ Shortlisted
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(app.applied_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                  })}
                </span>
              </div>

              {/* Candidate info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {app.candidate?.full_name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {app.candidate?.full_name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{app.candidate?.email}</span>
                  </div>
                </div>
              </div>

              {/* Job info */}
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {app.job?.title}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Building2 className="h-3 w-3 shrink-0" />
                  {app.job?.company_name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {app.job?.location}
                </div>
              </div>

              {/* Reject button */}
              <button
                onClick={() => handleReject(app.id)}
                disabled={updatingId === app.id}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {updatingId === app.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <X className="h-3.5 w-3.5" />
                }
                {updatingId === app.id ? 'Removing...' : 'Remove from Shortlist'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}