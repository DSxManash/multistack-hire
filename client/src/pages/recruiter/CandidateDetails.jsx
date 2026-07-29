// client/src/pages/recruiter/CandidateDetails.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCandidateById } from '../../api/jobApi'
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Code2,
  FileText,
  BarChart3,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar,
  CheckCircle2
} from "lucide-react";


export default function CandidateDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCandidateById(id)
      .then(setCandidate)
      .catch(() => setError('Failed to load candidate profile'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error ?? 'Candidate not found'}
      </div>
    )
  }

  const skills = candidate.skills
    ? (typeof candidate.skills === 'string'
        ? JSON.parse(candidate.skills)
        : candidate.skills)
    : []

  const scoreLabel = candidate.ranking_score == null ? null
    : candidate.ranking_score >= 70 ? 'Excellent'
    : candidate.ranking_score >= 50 ? 'Good'
    : candidate.ranking_score >= 30 ? 'Average'
    : 'Needs Improvement'

  const scoreLabelColor = candidate.ranking_score == null ? ''
    : candidate.ranking_score >= 70 ? 'text-green-600 dark:text-green-400'
    : candidate.ranking_score >= 50 ? 'text-brand-600 dark:text-brand-400'
    : candidate.ranking_score >= 30 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {candidate.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {candidate.full_name}
            </h2>
            <div className="mt-1 flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </span>
              {candidate.location && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {candidate.location}
                </span>
              )}
              {candidate.years_of_experience != null && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Briefcase className="h-3.5 w-3.5" />
                  {candidate.years_of_experience} years experience
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                Joined {new Date(candidate.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* ML Score badge */}
          {candidate.ranking_score != null && (
            <div className="shrink-0 text-center rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {candidate.ranking_score}
              </p>
              <p className={`text-xs font-medium ${scoreLabelColor}`}>
                {scoreLabel}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">AI Score</p>
            </div>
          )}
        </div>

        {candidate.bio && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            {candidate.bio}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">

        {/* Social / Coding links */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-brand-600" />
            Profiles & Links
          </h3>
          <div className="space-y-3">
            {candidate.github_username ? (
              <a
                href={'https://github.com/' + candidate.github_username}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
               <Code2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    GitHub
                  </p>
                  <p className="text-xs text-brand-600 dark:text-brand-400">
                    @{candidate.github_username}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-auto" />
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 opacity-50 dark:border-slate-800">
                <Code2 className="h-5 w-5 text-slate-400" />
                <p className="text-xs text-slate-400">GitHub not linked</p>
              </div>
            )}

            {candidate.leetcode_username ? (
              <a
                href={'https://leetcode.com/' + candidate.leetcode_username}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <Code2 className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    LeetCode
                  </p>
                  <p className="text-xs text-brand-600 dark:text-brand-400">
                    @{candidate.leetcode_username}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-auto" />
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 opacity-50 dark:border-slate-800">
                <Code2 className="h-5 w-5 text-slate-400" />
                <p className="text-xs text-slate-400">LeetCode not linked</p>
              </div>
            )}

            {candidate.linkedin_url ? (
              <a
                href={candidate.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <Briefcase className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    LinkedIn
                  </p>
                  <p className="text-xs text-brand-600 dark:text-brand-400 truncate max-w-[140px]">
                    {candidate.linkedin_url.replace('https://linkedin.com/in/', '')}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-auto" />
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 opacity-50 dark:border-slate-800">
                <Briefcase className="h-5 w-5 text-brand-600" />
                <p className="text-xs text-slate-400">LinkedIn not linked</p>
              </div>
            )}
          </div>
        </div>

        {/* Resume + Score */}
        <div className="space-y-4">

          {/* Resume */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              Resume
            </h3>
            {candidate.resume_url ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400">
                    Resume on file
                  </p>
                </div>
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
                >
                  View
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No resume uploaded</p>
            )}
          </div>

          {/* ML Score breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              AI Score
            </h3>
            {candidate.ranking_score != null ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Overall Score
                  </span>
                  <span className={`text-sm font-bold ${scoreLabelColor}`}>
                    {candidate.ranking_score}/100
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-brand-600 transition-all duration-700"
                    style={{ width: `${candidate.ranking_score}%` }}
                  />
                </div>
                <p className={`text-xs font-medium ${scoreLabelColor}`}>
                  {scoreLabel}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Not scored yet — ML pipeline pending
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span
                key={skill}
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}