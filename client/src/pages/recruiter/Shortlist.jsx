
import { useState, useEffect } from 'react'
import {
  getShortlisted,
  updateApplicationStatus,
  getCandidateById,
  getApplicantResumeBlob,
} from '../../api/jobApi'
import {
  Bookmark, Building2, MapPin, Calendar,
  Mail, Loader2, CheckCircle2, X,
  Briefcase, Code2, FileText, ExternalLink,
  BarChart3, GitBranch,
} from 'lucide-react'

function scoreMeta(score) {
  if (score == null) return { label: null, color: '' }
  if (score >= 70) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' }
  if (score >= 50) return { label: 'Good', color: 'text-brand-600 dark:text-brand-400' }
  if (score >= 30) return { label: 'Average', color: 'text-amber-600 dark:text-amber-400' }
  return { label: 'Needs Improvement', color: 'text-red-600 dark:text-red-400' }
}

function parseSkills(skills) {
  if (!skills) return []
  if (Array.isArray(skills)) return skills
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function ShortlistedDetailsModal({
  app,
  profile,
  profileLoading,
  profileError,
  cvUrl,
  cvLoading,
  cvError,
  onClose,
  onRemove,
  removing,
}) {
  const candidate = profile ?? app.candidate
  const skills = parseSkills(profile?.skills)
  const { label: scoreLabel, color: scoreLabelColor } = scoreMeta(profile?.ranking_score)
  const hasResumeHint = Boolean(profile?.resume_url) || Boolean(cvUrl) || cvLoading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {candidate?.full_name || 'Candidate'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shortlisted candidate details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Application / job context */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                ✓ Shortlisted
              </span>
              {app.applied_at && (
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3 w-3" />
                  Applied{' '}
                  {new Date(app.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
              {app.job?.title}
            </p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              {app.job?.company_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {app.job.company_name}
                </span>
              )}
              {app.job?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {app.job.location}
                </span>
              )}
            </div>
          </div>

          {profileLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
            </div>
          ) : profileError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {profileError}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                    {candidate?.full_name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {candidate?.full_name}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                        {candidate?.email}
                      </span>
                      {profile?.location && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {profile.location}
                        </span>
                      )}
                      {profile?.years_of_experience != null && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Briefcase className="h-3.5 w-3.5" />
                          {profile.years_of_experience} years experience
                        </span>
                      )}
                    </div>
                  </div>
                  {profile?.ranking_score != null && (
                    <div className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-center dark:border-slate-700">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {Math.round(profile.ranking_score)}
                      </p>
                      <p className={`text-xs font-medium ${scoreLabelColor}`}>{scoreLabel}</p>
                      <p className="text-xs text-slate-400">AI Score</p>
                    </div>
                  )}
                </div>
                {profile?.bio && (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Links */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <ExternalLink className="h-4 w-4 text-brand-600" />
                    Profiles & Links
                  </h4>
                  <div className="space-y-2">
                    {profile?.github_username ? (
                      <a
                        href={`https://github.com/${profile.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <GitBranch className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white">GitHub</p>
                          <p className="truncate text-xs text-brand-600 dark:text-brand-400">
                            @{profile.github_username}
                          </p>
                        </div>
                        <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-400" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 opacity-50 dark:border-slate-800">
                        <GitBranch className="h-5 w-5 text-slate-400" />
                        <p className="text-xs text-slate-400">GitHub not linked</p>
                      </div>
                    )}

                    {profile?.leetcode_username ? (
                      <a
                        href={`https://leetcode.com/${profile.leetcode_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <Code2 className="h-5 w-5 text-amber-600" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white">LeetCode</p>
                          <p className="truncate text-xs text-brand-600 dark:text-brand-400">
                            @{profile.leetcode_username}
                          </p>
                        </div>
                        <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-400" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 opacity-50 dark:border-slate-800">
                        <Code2 className="h-5 w-5 text-slate-400" />
                        <p className="text-xs text-slate-400">LeetCode not linked</p>
                      </div>
                    )}

                    {profile?.linkedin_url ? (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <Briefcase className="h-5 w-5 text-brand-600" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white">LinkedIn</p>
                          <p className="truncate text-xs text-brand-600 dark:text-brand-400">
                            Profile
                          </p>
                        </div>
                        <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-400" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 opacity-50 dark:border-slate-800">
                        <Briefcase className="h-5 w-5 text-brand-600" />
                        <p className="text-xs text-slate-400">LinkedIn not linked</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume + score */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <FileText className="h-4 w-4 text-brand-600" />
                      Resume
                    </h4>
                    {cvLoading ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading CV…
                      </div>
                    ) : cvUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-green-700 dark:text-green-400">
                              Resume on file
                            </p>
                          </div>
                          <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
                          >
                            Open
                          </a>
                        </div>
                        <iframe
                          title="CV preview"
                          src={cvUrl}
                          className="h-48 w-full rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        {cvError || (hasResumeHint ? 'Could not load CV' : 'No resume uploaded')}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <BarChart3 className="h-4 w-4 text-brand-600" />
                      AI Score
                    </h4>
                    {profile?.ranking_score != null ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Overall</span>
                          <span className={`text-sm font-bold ${scoreLabelColor}`}>
                            {Math.round(profile.ranking_score)}/100
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-brand-600 transition-all duration-700"
                            style={{ width: `${Math.min(100, Math.max(0, profile.ranking_score))}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Not scored yet</p>
                    )}
                  </div>
                </div>
              </div>

              {skills.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
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
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onRemove(app.id)}
            disabled={removing}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            {removing ? 'Removing...' : 'Remove from Shortlist'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecruiterShortlist() {
  const [shortlisted, setShortlisted] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const [selectedApp, setSelectedApp] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [cvUrl, setCvUrl] = useState(null)
  const [cvLoading, setCvLoading] = useState(false)
  const [cvError, setCvError] = useState(null)

  useEffect(() => {
    getShortlisted()
      .then(setShortlisted)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    return () => {
      if (cvUrl) URL.revokeObjectURL(cvUrl)
    }
  }, [cvUrl])

  function clearCvUrl() {
    setCvUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  function closeModal() {
    setSelectedApp(null)
    setProfile(null)
    setProfileError(null)
    setProfileLoading(false)
    setCvError(null)
    setCvLoading(false)
    clearCvUrl()
  }

  async function openDetails(app) {
    setSelectedApp(app)
    setProfile(null)
    setProfileError(null)
    setProfileLoading(true)
    setCvError(null)
    clearCvUrl()
    setCvLoading(true)

    const candidateId = app.candidate?.id
    const jobId = app.job?.id
    const applicationId = app.id

    try {
      if (candidateId) {
        const data = await getCandidateById(candidateId)
        setProfile(data)
      }
    } catch {
      setProfileError('Failed to load candidate profile')
    } finally {
      setProfileLoading(false)
    }

    try {
      if (jobId && applicationId) {
        const blob = await getApplicantResumeBlob(jobId, applicationId)
        setCvUrl(URL.createObjectURL(blob))
      }
    } catch {
      setCvError(null) // treat as no CV unless profile said otherwise
    } finally {
      setCvLoading(false)
    }
  }

  async function handleReject(applicationId) {
    setUpdatingId(applicationId)
    try {
      await updateApplicationStatus(applicationId, 'rejected')
      setShortlisted((prev) => prev.filter((a) => a.id !== applicationId))
      setSuccessMsg('Candidate removed from shortlist')
      setTimeout(() => setSuccessMsg(null), 3000)
      if (selectedApp?.id === applicationId) {
        closeModal()
      }
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
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Shortlisted Candidates
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {shortlisted.length} candidate{shortlisted.length !== 1 ? 's' : ''} shortlisted
        </p>
      </div>

      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white shadow-xl animate-slideUp">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

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
              role="button"
              tabIndex={0}
              onClick={() => openDetails(app)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openDetails(app)
                }
              }}
              className="flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                  ✓ Shortlisted
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(app.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

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

              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
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

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReject(app.id)
                }}
                disabled={updatingId === app.id}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {updatingId === app.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <X className="h-3.5 w-3.5" />}
                {updatingId === app.id ? 'Removing...' : 'Remove from Shortlist'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <ShortlistedDetailsModal
          app={selectedApp}
          profile={profile}
          profileLoading={profileLoading}
          profileError={profileError}
          cvUrl={cvUrl}
          cvLoading={cvLoading}
          cvError={cvError}
          onClose={closeModal}
          onRemove={handleReject}
          removing={updatingId === selectedApp.id}
        />
      )}
    </div>
  )
}
