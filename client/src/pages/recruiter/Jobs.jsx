// client/src/pages/recruiter/Jobs.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' // ✅ Added
import { createJob, getMyJobs, closeJob } from '../../api/jobApi' // ✅ Cleaned imports
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

// ── Post Job Modal ────────────────────────────────────────────────
function PostJobModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', company_name: '', location: '',
    job_type: 'full_time', description: '', requirements: '',
    application_deadline: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'application_deadline' ? (value || null) : value,
    }))
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Post a New Job
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
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
              <input name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Senior React Developer" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Company Name *
              </label>
              <input name="company_name" required value={form.company_name} onChange={handleChange} placeholder="e.g. TechCorp Nepal" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Location *
              </label>
              <input name="location" required value={form.location} onChange={handleChange} placeholder="e.g. Kathmandu, Nepal" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Job Type *
              </label>
              <select name="job_type" value={form.job_type} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
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
            <textarea name="description" required value={form.description} onChange={handleChange} rows={3} placeholder="Describe the role, responsibilities..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Requirements *
            </label>
            <textarea name="requirements" required value={form.requirements} onChange={handleChange} rows={3} placeholder="List required skills, experience, qualifications..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Application Deadline
            </label>
            <input type="datetime-local" name="application_deadline" value={form.application_deadline || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Leave blank to use the default 30-day deadline.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function RecruiterJobs() {
  const navigate = useNavigate() // ✅ Added
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  // ✅ Removed selectedJob state
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
                    onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`, { replace: false })}
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

      {/*  REMOVED: Applications side panel */}
    </>
  )
}