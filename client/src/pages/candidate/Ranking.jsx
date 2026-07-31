// client/src/pages/candidate/Ranking.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getProfile,
  getMyRankingScore,
  triggerMyScoring
} from '../../api/candidateApi'

// ----- Import all icons as a namespace -----
import * as Icons from 'lucide-react'

// Destructure with fallbacks – if the export is missing, use a simple span/emoji
const {
  BarChart3 = () => <span>📊</span>,
  Github = () => <span>🐙</span>,
  Code2 = () => <span>⚡</span>,
  FileText = () => <span>📄</span>,
  ArrowRight = () => <span>→</span>,
  Loader2 = () => <span>⏳</span>,
  AlertCircle = () => <span>⚠️</span>,
  TrendingUp = () => <span>📈</span>,
  Lock = () => <span>🔒</span>,
  RefreshCw = () => <span>🔄</span>,
  CheckCircle2 = () => <span>✅</span>,
} = Icons

// ── Score Ring ─────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const filled = score != null ? (score / 100) * circumference : 0
  const color = score == null ? '#94a3b8'
    : score >= 70 ? '#22c55e'
    : score >= 40 ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none"
          stroke="#e2e8f0" strokeWidth="10"
          className="dark:stroke-slate-800" />
        <circle cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute text-center">
        {score != null ? (
          <>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{score}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">out of 100</p>
          </>
        ) : (
          <>
            <Lock className="mx-auto h-6 w-6 text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Not scored</p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Factor Bar ─────────────────────────────────────────────────
function FactorBar({ label, icon: Icon, value, color, description }) {
  // Ensure Icon is a valid component; fallback to a simple span
  const IconComponent = typeof Icon === 'function' ? Icon : () => <span className="h-4 w-4 text-slate-400">•</span>

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-4 w-4 ${color}`} strokeWidth={1.75} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {value != null ? `${Math.round(value)}/35` : '—'}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${value != null ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          style={{ width: value != null ? `${Math.min((value / 35) * 100, 100)}%` : '0%' }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function CandidateRanking() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [scoreData, setScoreData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [profileData, scoreResult] = await Promise.all([
          getProfile(),
          getMyRankingScore().catch(() => null),
        ])
        setProfile(profileData)
        setScoreData(scoreResult)
      } catch {
        setError('Failed to load ranking data')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  async function handleTriggerScoring() {
    setIsScoring(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const result = await triggerMyScoring()
      setScoreData(result)
      const updated = await getProfile()
      setProfile(updated)
      setSuccessMsg('Score calculated successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Scoring failed. Check your profile.')
    } finally {
      setIsScoring(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const score = profile?.ranking_score ?? null
  const hasGithub = !!profile?.github_username
  const hasLeetcode = !!profile?.leetcode_username
  const hasResume = !!profile?.resume_url
  const isReady = hasGithub && hasLeetcode && hasResume

  const scoreLabel = score == null ? null
    : score >= 70 ? 'Excellent'
    : score >= 50 ? 'Good'
    : score >= 30 ? 'Average'
    : 'Needs Improvement'

  const scoreLabelColor = score == null ? ''
    : score >= 70 ? 'text-green-600 dark:text-green-400'
    : score >= 50 ? 'text-brand-600 dark:text-brand-400'
    : score >= 30 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  const shap = scoreData?.shap_breakdown ?? null

  return (
    <div className="space-y-6 max-w-3xl">

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Ranking Score</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          AI-powered evaluation based on GitHub, LeetCode, and resume analysis
        </p>
      </div>

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

      {!isReady && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Complete your profile to get scored
            </p>
            <div className="mt-2 space-y-1">
              {!hasGithub && <p className="text-xs text-amber-700 dark:text-amber-400">✗ GitHub username not set</p>}
              {!hasLeetcode && <p className="text-xs text-amber-700 dark:text-amber-400">✗ LeetCode username not set</p>}
              {!hasResume && <p className="text-xs text-amber-700 dark:text-amber-400">✗ Resume not uploaded</p>}
            </div>
            <button
              onClick={() => navigate('/candidate/profile')}
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400"
            >
              Complete Profile <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col items-center sm:flex-row sm:gap-8">
          <ScoreRing score={score} />
          <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1">
            {score != null ? (
              <>
                <p className={`text-2xl font-bold ${scoreLabelColor}`}>{scoreLabel}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your AI-generated candidate score
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Scored by XGBoost ML model
                  </span>
                </div>
                {profile?.last_scored_at && (
                  <p className="mt-1 text-xs text-slate-400">
                    Last scored: {new Date(profile.last_scored_at).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {isReady ? 'Ready to Score' : 'Score Not Available'}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  {isReady
                    ? 'Your profile is complete. Click the button to calculate your AI ranking score.'
                    : 'Complete your profile with GitHub, LeetCode, and resume first.'
                  }
                </p>
              </>
            )}

            {isReady && (
              <button
                onClick={handleTriggerScoring}
                disabled={isScoring}
                className="mt-4 flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isScoring ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Calculating...</>
                ) : score != null ? (
                  <><RefreshCw className="h-4 w-4" /> Recalculate Score</>
                ) : (
                  <><BarChart3 className="h-4 w-4" /> Calculate My Score</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {shap && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            <FactorBar
              label="GitHub Activity"
              icon={Github}
              value={shap.github}
              color="text-slate-700 dark:text-slate-300"
              description="Followers, repos, language diversity, account age"
            />
            <FactorBar
              label="LeetCode Performance"
              icon={Code2}
              value={shap.leetcode}
              color="text-amber-600 dark:text-amber-400"
              description="Easy, medium, hard problems solved"
            />
            <FactorBar
              label="Resume / CV"
              icon={FileText}
              value={shap.cv}
              color="text-brand-600 dark:text-brand-400"
              description="Skills, projects, internships, certifications, CGPA"
            />
          </div>
        </div>
      )}

      {scoreData?.github_data && Object.keys(scoreData.github_data).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Github className="h-4 w-4" /> GitHub Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Public Repos', value: scoreData.github_data.public_repos },
              { label: 'Total Stars', value: scoreData.github_data.total_stars },
              { label: 'Followers', value: scoreData.github_data.followers },
              { label: 'Languages', value: scoreData.github_data.language_count },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value ?? '—'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {scoreData?.leetcode_data && Object.keys(scoreData.leetcode_data).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-amber-600" /> LeetCode Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Solved', value: scoreData.leetcode_data.total_solved },
              { label: 'Easy', value: scoreData.leetcode_data.easy_solved },
              { label: 'Medium', value: scoreData.leetcode_data.medium_solved },
              { label: 'Hard', value: scoreData.leetcode_data.hard_solved },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value ?? '—'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {scoreData?.cv_features && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" /> Resume Analysis
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: 'Skills', value: scoreData.cv_features.cv_skills },
              { label: 'Projects', value: scoreData.cv_features.cv_projects },
              { label: 'Internships', value: scoreData.cv_features.cv_internships },
              { label: 'Certifications', value: scoreData.cv_features.cv_certifications },
              { label: 'CGPA', value: scoreData.cv_features.cv_cgpa },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value ?? '—'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">How Scoring Works</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Github, label: 'GitHub (35%)', desc: 'Followers, repos, language diversity, account age', color: 'bg-slate-50 dark:bg-slate-900' },
            { icon: Code2, label: 'LeetCode (35%)', desc: 'Easy, medium, hard problems solved and weighted', color: 'bg-amber-50 dark:bg-amber-950/30' },
            { icon: FileText, label: 'Resume (30%)', desc: 'Skills, projects, internships, certifications, CGPA', color: 'bg-brand-50 dark:bg-brand-950/30' },
          ].map(item => (
            <div key={item.label} className={`rounded-lg p-4 ${item.color}`}>
              <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 mb-2" strokeWidth={1.75} />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">{item.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}