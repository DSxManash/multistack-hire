// client/src/pages/recruiter/JobApplications.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getRankedApplicants,
  getJobApplications,
  updateApplicationStatus,
  scoreJobApplicants,
} from '../../api/jobApi'
// ⚠️ KEPT EXACT IMPORTS TO AVOID VITE CACHE ERRORS
import {
  ArrowLeft, Users, Brain, Loader2,
  CheckCircle2, AlertCircle, GitBranch,
  Code2, Mail, Info
} from 'lucide-react'

const statusColors = {
  applied:     'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 ring-1 ring-brand-200/40 dark:ring-brand-800/40',
  reviewed:    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
  shortlisted: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
  rejected:    'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-red-200/40 dark:ring-red-800/40',
}

function ScoreBar({ score }) {
  if (score == null) return (
    <span className="text-xs text-slate-400 dark:text-slate-500">Not scored</span>
  )
  const color = score >= 70 ? 'bg-green-500'
    : score >= 40 ? 'bg-amber-500'
    : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-bold min-w-[36px] text-right ${
        score >= 70 ? 'text-green-600 dark:text-green-400'
        : score >= 40 ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-500 dark:text-red-400'
      }`}>
        {score}
      </span>
    </div>
  )
}

export default function JobApplications() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScoring, setIsScoring] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [error, setError] = useState(null)
  const [scoringResult, setScoringResult] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadApplicants() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getRankedApplicants(jobId)
        if (mounted) {
          setData(result)
        }
      } catch {
        try {
          const apps = await getJobApplications(jobId)
          if (mounted) {
            setData({ applicants: apps, job_title: 'Job Applications', total: apps.length })
          }
        } catch {
          if (mounted) {
            setError('Failed to load applications')
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadApplicants()

    return () => {
      mounted = false
    }
  }, [jobId])

  async function handleScoreAll() {
    setIsScoring(true)
    setError(null)
    setScoringResult(null)
    try {
      const result = await scoreJobApplicants(jobId)
      setScoringResult(result)
      setSuccessMsg(`Scored ${result.scored} candidates successfully!`)
      setTimeout(() => setSuccessMsg(null), 4000)
      // Reload ranked list
      const ranked = await getRankedApplicants(jobId)
      setData(ranked)
    } catch (err) {
      setError(err.response?.data?.detail || 'Scoring failed')
    } finally {
      setIsScoring(false)
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    setUpdatingId(applicationId)
    try {
      await updateApplicationStatus(applicationId, newStatus)
      setData(prev => ({
        ...prev,
        applicants: prev.applicants.map(a =>
          (a.application_id ?? a.id) === applicationId
            ? { ...a, status: newStatus }
            : a
        )
      }))
    } catch {
      setError('Failed to update status')
      setTimeout(() => setError(null), 3000)
    } finally {
      setUpdatingId(null)
    }
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
            onClick={() => navigate('/recruiter/jobs')}
            className="mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {data?.job_title ?? 'Applications'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} · ranked by AI score
            </p>
          </div>
        </div>

        {/* Score All button */}
        <button
          onClick={handleScoreAll}
          disabled={isScoring || applicants.length === 0}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isScoring
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Scoring...</>
            : <><Brain className="h-4 w-4" /> Score All Candidates</>
          }
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Professional Scoring result summary */}
      {scoringResult && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/80 p-4 backdrop-blur-sm dark:border-brand-900 dark:bg-brand-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <p className="text-sm font-medium text-brand-800 dark:text-brand-300">
              Scoring Complete
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 shadow-sm dark:bg-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{scoringResult.total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Candidates</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 shadow-sm dark:bg-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{scoringResult.scored}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scored</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 shadow-sm dark:bg-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-500 dark:text-red-400">{scoringResult.failed}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Failed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
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
        /* Ranked applicants table */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400 w-14">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Candidate</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[150px]">AI Score</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">Profiles</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">Skills</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium text-slate-600 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applicants.map((app, index) => {
                  const candidate = app.candidate ?? app
                  const appId = app.application_id ?? app.id
                  const status = app.status
                  const score = candidate.ranking_score
                  const skills = candidate.skills ?? []
                  const isUpdating = updatingId === appId

                  return (
                    <tr key={appId} className="border-l-2 border-l-transparent transition-all hover:bg-slate-50/80 hover:border-l-brand-500 dark:hover:bg-slate-800/50 dark:hover:border-l-brand-400">

                      {/* Rank */}
                      <td className="px-5 py-4">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40'
                          : index === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 ring-1 ring-orange-200/40 dark:ring-orange-800/40'
                          : 'bg-slate-50 text-slate-400 dark:bg-slate-900'
                        }`}>
                          #{index + 1}
                        </div>
                      </td>

                      {/* Candidate */}
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
                              <span className="truncate max-w-[140px]">{candidate.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-5 py-4">
                        <ScoreBar score={score} />
                      </td>

                      {/* Profiles (Using GitBranch as requested) */}
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          {candidate.github_username && (
                            <a
                              href={'https://github.com/' + candidate.github_username}
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
                              href={'https://leetcode.com/' + candidate.leetcode_username}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400"
                            >
                              <Code2 className="h-3 w-3" />
                              {candidate.leetcode_username}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {skills.slice(0, 3).map(s => (
                            <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 ring-1 ring-brand-200/40 dark:ring-brand-800/40">
                              {s}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                              +{skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            status === 'applied' ? 'bg-brand-500' :
                            status === 'reviewed' ? 'bg-amber-500' :
                            status === 'shortlisted' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {status !== 'shortlisted' && status !== 'rejected' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusChange(appId, 'shortlisted')}
                              disabled={isUpdating}
                              className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40"
                            >
                              {isUpdating ? '...' : 'Shortlist'}
                            </button>
                            <button
                              onClick={() => handleStatusChange(appId, 'rejected')}
                              disabled={isUpdating}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 ring-1 ring-red-200/40 dark:ring-red-800/40"
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
                            {status === 'shortlisted' ? '✓' : '✗'} 
                            {status === 'shortlisted' ? ' Shortlisted' : ' Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}