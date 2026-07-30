
import { useState, useEffect } from 'react'

import {
  createJob, getMyJobs, closeJob, getJobApplications, updateApplicationStatus , getRankedApplicants
} from '../../api/jobApi'
import {
  Plus, Briefcase, MapPin, Users, Calendar,
  X, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, Trash2
} from 'lucide-react'


const jobTypeLabel = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
}

const statusColors = {
  applied:     'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  reviewed:    'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  shortlisted: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  rejected:    'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
}

// ── Post Job Modal ────────────────────────────────────────────────
function PostJobModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', company_name: '', location: '',
    job_type: 'full_time', description: '', requirements: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const job = await createJob(form)
      onSuccess(job)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Post a New Job
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Job Title *
              </label>
              <input
                name="title" required value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior React Developer"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Company Name *
              </label>
              <input
                name="company_name" required value={form.company_name}
                onChange={handleChange}
                placeholder="e.g. TechCorp Nepal"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Location *
              </label>
              <input
                name="location" required value={form.location}
                onChange={handleChange}
                placeholder="e.g. Kathmandu, Nepal"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Job Type *
              </label>
              <select
                name="job_type" value={form.job_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description *
            </label>
            <textarea
              name="description" required value={form.description}
              onChange={handleChange} rows={3}
              placeholder="Describe the role, responsibilities..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Requirements *
            </label>
            <textarea
              name="requirements" required value={form.requirements}
              onChange={handleChange} rows={3}
              placeholder="List required skills, experience, qualifications..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


function ApplicationsPanel({ job, onClose }) {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    getRankedApplicants(job.id)
      .then(data => setApplications(data.applicants ?? []))
      .catch(() => getJobApplications(job.id).then(setApplications))
      .finally(() => setIsLoading(false))
  }, [job.id])

  async function handleStatusChange(applicationId, newStatus) {
    setUpdatingId(applicationId)
    try {
      await updateApplicationStatus(applicationId, newStatus)
      setApplications(prev =>
        prev.map(a => a.application_id === applicationId
          ? { ...a, status: newStatus }
          : a
        )
      )
    } catch {
    } finally {
      setUpdatingId(null)
    }
  }

  const statusColors = {
    applied:     'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
    reviewed:    'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    shortlisted: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
    rejected:    'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Applications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {job.title} · {applications.length} applicant{applications.length !== 1 ? 's' : ''} · ranked by AI score
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No applications yet</p>
            </div>
          ) : (
            applications.map((app, index) => {
              const candidate = app.candidate ?? app
              const appId = app.application_id ?? app.id
              const status = app.status
              const score = candidate.ranking_score

              return (
                <div key={appId} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  {/* Rank + candidate */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      #{index + 1}
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                      {candidate.full_name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {candidate.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {candidate.email ?? '—'}
                      </p>
                    </div>
                    {/* AI Score badge */}
                    {score != null ? (
                      <div className="shrink-0 text-center">
                        <p className={`text-sm font-bold ${
                          score >= 70 ? 'text-green-600 dark:text-green-400'
                          : score >= 40 ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-500'
                        }`}>
                          {score}
                        </p>
                        <p className="text-xs text-slate-400">AI Score</p>
                      </div>
                    ) : (
                      <div className="shrink-0 text-center">
                        <p className="text-xs text-slate-400">Not scored</p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[status]}`}>
                      {status}
                    </span>
                    <p className="text-xs text-slate-400">
                      {new Date(app.applied_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  {status !== 'shortlisted' && status !== 'rejected' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleStatusChange(appId, 'shortlisted')}
                        disabled={updatingId === appId}
                        className="flex-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 dark:bg-green-950 dark:text-green-400"
                      >
                        {updatingId === appId ? '...' : 'Shortlist'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(appId, 'rejected')}
                        disabled={updatingId === appId}
                        className="flex-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950 dark:text-red-400"
                      >
                        {updatingId === appId ? '...' : 'Reject'}
                      </button>
                    </div>
                  )}
                  {(status === 'shortlisted' || status === 'rejected') && (
                    <p className="mt-2 text-xs text-slate-400 italic">Decision made</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}



// ── Main Page ─────────────────────────────────────────────────────
export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [closingId, setClosingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    getMyJobs()
      .then(setJobs)
      .finally(() => setIsLoading(false))
  }, [])

  function handleJobCreated(newJob) {
    setJobs(prev => [newJob, ...prev])
    setSuccessMsg('Job posted successfully!')
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  async function handleCloseJob(jobId) {
    setClosingId(jobId)
    try {
      await closeJob(jobId)
      setJobs(prev => prev.filter(j => j.id !== jobId))
      setSuccessMsg('Job closed successfully')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch {
      // silent fail
    } finally {
      setClosingId(null)
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
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              My Job Postings
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {jobs.length} active posting{jobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Job list */}
        {jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-950">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              No job postings yet
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Click "Post Job" to create your first listing
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                {/* Job type + status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                    {jobTypeLabel[job.job_type]}
                  </span>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                    Active
                  </span>
                </div>

                {/* Title + meta */}
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                  {job.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.company_name} · {job.location}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(job.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  {job.application_count ?? 0} application{job.application_count !== 1 ? 's' : ''}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    View Applications
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCloseJob(job.id)}
                    disabled={closingId === job.id}
                    className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    {closingId === job.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PostJobModal
          onClose={() => setShowModal(false)}
          onSuccess={handleJobCreated}
        />
      )}

      {/* Applications side panel */}
      {selectedJob && (
        <ApplicationsPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  )
}