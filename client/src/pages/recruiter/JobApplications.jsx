// client/src/pages/recruiter/JobApplications.jsx

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getRankedApplicants,
  getJobApplications,
  updateApplicationStatus,
  scoreJobApplicants,
  getApplicantResumeBlob,
} from '../../api/jobApi'
import {
  ArrowLeft, Users, Brain, Loader2,
  CheckCircle2, AlertCircle, GitBranch,
  Code2, Mail, FileText, X,
} from 'lucide-react'

const ACTIVE_JOB_STORAGE_KEY = 'recruiterActiveJobId'

const statusColors = {
  applied:     'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 ring-1 ring-brand-200/40 dark:ring-brand-800/40',
  reviewed:    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
  shortlisted: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
  rejected:    'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-red-200/40 dark:ring-red-800/40',
}

function ScoreBar({ score }) {
  if (score == null) {
    return <span className="text-xs text-slate-400 dark:text-slate-500">Not scored</span>
  }
  const color = score >= 70 ? 'bg-green-500'
    : score >= 40 ? 'bg-amber-500'
    : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className={`h-1.5 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className={`text-sm font-bold min-w-[36px] text-right ${
        score >= 70 ? 'text-green-600 dark:text-green-400'
        : score >= 40 ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-500 dark:text-red-400'
      }`}>
        {Math.round(score)}
      </span>
    </div>
  )
}

function CvPreviewModal({ url, name, onClose }) {
  if (!url) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {name || 'Candidate CV'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">PDF preview</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Open in tab
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close CV preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <iframe title="CV preview" src={url} className="h-full w-full bg-slate-100 dark:bg-slate-900" />
      </div>
    </div>
  )
}

function resolveJobId(location) {
  const fromState = location.state?.jobId
  if (fromState) {
    sessionStorage.setItem(ACTIVE_JOB_STORAGE_KEY, fromState)
    return fromState
  }
  return sessionStorage.getItem(ACTIVE_JOB_STORAGE_KEY)
}

function sortByScore(applicants) {
  return [...applicants].sort((a, b) => {
    const sa = (a.candidate ?? a).ranking_score
    const sb = (b.candidate ?? b).ranking_score
    if (sa == null && sb == null) return 0
    if (sa == null) return 1
    if (sb == null) return -1
    return sb - sa
  })
}

export default function JobApplications() {
  const navigate = useNavigate()
  const location = useLocation()
  const jobId = resolveJobId(location)

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScoring, setIsScoring] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [error, setError] = useState(null)
  const [isRanked, setIsRanked] = useState(false)
  const [animateRank, setAnimateRank] = useState(false)
  const [cvPreview, setCvPreview] = useState(null)
  const [cvLoadingId, setCvLoadingId] = useState(null)

  useEffect(() => {
    return () => {
      if (cvPreview?.url) URL.revokeObjectURL(cvPreview.url)
    }
  }, [cvPreview])

  useEffect(() => {
    if (!jobId) {
      navigate('/recruiter/jobs', { replace: true })
      return
    }

    let mounted = true

    async function loadApplicants() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getRankedApplicants(jobId)
        if (!mounted) return
        const ranked = Boolean(result.ranked)
        const applicants = ranked
          ? sortByScore(result.applicants ?? [])
          : (result.applicants ?? [])
        setData({ ...result, applicants })
        setIsRanked(ranked)
      } catch {
        try {
          const apps = await getJobApplications(jobId)
          if (!mounted) return
          setData({
            applicants: apps,
            job_title: location.state?.jobTitle || 'Job Applications',
            total: apps.length,
            ranked: false,
          })
          setIsRanked(false)
        } catch {
          if (mounted) setError('Failed to load applications')
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadApplicants()
    return () => { mounted = false }
  }, [jobId, navigate, location.state?.jobTitle])

  async function handleRankCandidates() {
    setIsScoring(true)
    setError(null)
    try {
      const result = await scoreJobApplicants(jobId)
      const rankedList = sortByScore(result.applicants ?? [])
      setSuccessMsg(
        result.scored > 0
          ? `Ranked ${result.scored} candidate${result.scored !== 1 ? 's' : ''} successfully`
          : 'Ranking finished — no candidates could be scored'
      )
      setTimeout(() => setSuccessMsg(null), 4000)

      setIsRanked(true)
      setAnimateRank(true)
      setData((prev) => ({
        ...prev,
        job_title: result.job_title ?? prev?.job_title,
        ranked: true,
        applicants: rankedList,
        total_applicants: rankedList.length,
      }))
      setTimeout(() => setAnimateRank(false), 1600)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ranking failed')
    } finally {
      setIsScoring(false)
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    setUpdatingId(applicationId)
    try {
      await updateApplicationStatus(applicationId, newStatus)
      setData((prev) => ({
        ...prev,
        applicants: prev.applicants.map((a) =>
          (a.application_id ?? a.id) === applicationId
            ? { ...a, status: newStatus }
            : a
        ),
      }))
    } catch {
      setError('Failed to update status')
      setTimeout(() => setError(null), 3000)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleOpenCv(appId, name) {
    if (!jobId || !appId) return
    setCvLoadingId(appId)
    setError(null)
    try {
      const blob = await getApplicantResumeBlob(jobId, appId)
      const url = URL.createObjectURL(blob)
      setCvPreview((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url)
        return { url, name }
      })
    } catch {
      setError('Could not load CV')
      setTimeout(() => setError(null), 3000)
    } finally {
      setCvLoadingId(null)
    }
  }

  function closeCvPreview() {
    setCvPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
      </div>
    )
  }

  const applicants = data?.applicants ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {data?.job_title ?? 'Applications'}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isRanked
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200/40 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-800/40'
                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/40 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isRanked ? 'bg-green-500' : 'bg-slate-400'}`} />
                {isRanked ? 'Ranked' : 'Unranked'}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
              {isRanked ? ' · sorted by AI score' : ' · rank candidates to reveal AI scores'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRankCandidates}
          disabled={isScoring || applicants.length === 0}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isScoring
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Ranking...</>
            : <><Brain className="h-4 w-4" /> Rank Candidates</>
          }
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {applicants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Users className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
            No applications yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Candidates will appear here after they apply
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="w-14 px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Candidate</th>
                  {isRanked && (
                    <th className="min-w-[150px] px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                      AI Score
                    </th>
                  )}
                  <th className="hidden px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400 sm:table-cell">
                    Profiles
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium text-slate-600 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence initial={false}>
                  {applicants.map((app, index) => {
                    const candidate = app.candidate ?? app
                    const appId = app.application_id ?? app.id
                    const status = app.status
                    const score = candidate.ranking_score
                    const isUpdating = updatingId === appId
                    const hasResume = Boolean(candidate.has_resume)
                    const isCvLoading = cvLoadingId === appId

                    return (
                      <motion.tr
                        key={appId}
                        layout
                        initial={animateRank ? { opacity: 0, y: 16 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.35, delay: animateRank ? index * 0.05 : 0 },
                          y: { duration: 0.4, delay: animateRank ? index * 0.05 : 0, ease: [0.22, 1, 0.36, 1] },
                        }}
                        className="border-l-2 border-l-transparent transition-colors hover:border-l-brand-500 hover:bg-slate-50/80 dark:hover:border-l-brand-400 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-5 py-4">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            isRanked && index === 0
                              ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200/40 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800/40'
                              : isRanked && index === 1
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : isRanked && index === 2
                                  ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-200/40 dark:bg-orange-950/40 dark:text-orange-400 dark:ring-orange-800/40'
                                  : 'bg-slate-50 text-slate-400 dark:bg-slate-900'
                          }`}>
                            #{index + 1}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white dark:bg-brand-500">
                              {candidate.full_name?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                {candidate.full_name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Mail className="h-3 w-3" />
                                <span className="max-w-[140px] truncate">{candidate.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {isRanked && (
                          <td className="px-5 py-4">
                            <ScoreBar score={score} />
                          </td>
                        )}

                        <td className="hidden px-5 py-4 sm:table-cell">
                          <div className="flex flex-wrap items-center gap-2">
                            {candidate.github_username && (
                              <a
                                href={`https://github.com/${candidate.github_username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                              >
                                <GitBranch className="h-3 w-3" />
                                {candidate.github_username}
                              </a>
                            )}
                            {candidate.leetcode_username && (
                              <a
                                href={`https://leetcode.com/${candidate.leetcode_username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400"
                              >
                                <Code2 className="h-3 w-3" />
                                {candidate.leetcode_username}
                              </a>
                            )}
                            {hasResume ? (
                              <button
                                type="button"
                                onClick={() => handleOpenCv(appId, candidate.full_name)}
                                disabled={isCvLoading}
                                className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60 dark:bg-brand-950/40 dark:text-brand-400"
                              >
                                {isCvLoading
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <FileText className="h-3 w-3" />}
                                CV
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">No CV</span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[status]}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              status === 'applied' ? 'bg-brand-500'
                                : status === 'reviewed' ? 'bg-amber-500'
                                  : status === 'shortlisted' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {status !== 'shortlisted' && status !== 'rejected' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(appId, 'shortlisted')}
                                disabled={isUpdating}
                                className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 ring-1 ring-green-200/40 transition-colors hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-800/40"
                              >
                                {isUpdating ? '...' : 'Shortlist'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(appId, 'rejected')}
                                disabled={isUpdating}
                                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200/40 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/40"
                              >
                                {isUpdating ? '...' : 'Reject'}
                              </button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              status === 'shortlisted'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-500 dark:text-red-400'
                            }`}>
                              {status === 'shortlisted' ? '✓ Shortlisted' : '✗ Rejected'}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white shadow-xl animate-slideUp">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {cvPreview && (
        <CvPreviewModal
          url={cvPreview.url}
          name={cvPreview.name}
          onClose={closeCvPreview}
        />
      )}
    </div>
  )
}
