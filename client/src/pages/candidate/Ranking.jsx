
import { useState, useEffect } from 'react'
import { getProfile } from '../../api/candidateApi'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3, Github, Code2, FileText,
  ArrowRight, Loader2, AlertCircle,
  TrendingUp, Info, Lock
} from 'lucide-react'

// Score ring component
function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const filled = score != null
    ? (score / 100) * circumference
    : 0

  const color = score == null ? '#94a3b8'
    : score >= 70 ? '#22c55e'
    : score >= 40 ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        {/* Background ring */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          className="dark:stroke-slate-800"
        />
        {/* Score ring */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute text-center">
        {score != null ? (
          <>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {score}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              out of 100
            </p>
          </>
        ) : (
          <>
            <Lock className="mx-auto h-6 w-6 text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Not scored
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// Factor bar component
function FactorBar({ label, icon: Icon, value, maxValue, color, description }) {
  const percentage = value != null ? Math.min((value / maxValue) * 100, 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.75} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </span>
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {value != null ? value : '—'}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            value != null ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  )
}

export default function CandidateRanking() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setError('Failed to load ranking data'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    )
  }

  const score = profile?.ranking_score ?? null
  const hasGithub = !!profile?.github_username
  const hasLeetcode = !!profile?.leetcode_username
  const hasResume = !!profile?.resume_url
  const isReady = hasGithub && hasLeetcode && hasResume

  // Score label
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

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          My Ranking Score
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          AI-powered evaluation based on your GitHub activity,
          LeetCode performance, and resume quality
        </p>
      </div>

      {/* Not ready warning */}
      {!isReady && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Complete your profile to get scored
            </p>
            <div className="mt-2 space-y-1">
              {!hasGithub && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ✗ GitHub username not set
                </p>
              )}
              {!hasLeetcode && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ✗ LeetCode username not set
                </p>
              )}
              {!hasResume && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ✗ Resume not uploaded
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/candidate/profile')}
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400"
            >
              Complete Profile <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Score card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-8">

          {/* Score ring */}
          <ScoreRing score={score} />

          {/* Score details */}
          <div className="mt-4 sm:mt-0 text-center sm:text-left">
            {score != null ? (
              <>
                <p className={`text-2xl font-bold ${scoreLabelColor}`}>
                  {scoreLabel}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your profile ranks in the top tier of candidates
                </p>
                <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Score generated by XGBoost ML model
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  Score Not Generated Yet
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  {isReady
                    ? 'Your profile is ready. The ML model will score you when you apply to a job.'
                    : 'Complete your profile with GitHub, LeetCode, and resume to get scored.'
                  }
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Score Breakdown
          </h3>
          <div className="group relative">
            <Info className="h-4 w-4 text-slate-400 cursor-help" />
            <div className="absolute left-6 top-0 z-10 hidden w-48 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-600 shadow-sm group-hover:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Scores are calculated by XGBoost ML model using SHAP values
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <FactorBar
            label="GitHub Activity"
            icon={Github}
            value={profile?.github_username ? null : null}
            maxValue={100}
            color="text-slate-700 dark:text-slate-300"
            description={
              profile?.github_username
                ? `@${profile.github_username} — data fetched on scoring`
                : 'Add GitHub username to your profile'
            }
          />
          <FactorBar
            label="LeetCode Performance"
            icon={Code2}
            value={profile?.leetcode_username ? null : null}
            maxValue={100}
            color="text-amber-600 dark:text-amber-400"
            description={
              profile?.leetcode_username
                ? `@${profile.leetcode_username} — data fetched on scoring`
                : 'Add LeetCode username to your profile'
            }
          />
          <FactorBar
            label="Resume Quality"
            icon={FileText}
            value={profile?.resume_url ? null : null}
            maxValue={100}
            color="text-brand-600 dark:text-brand-400"
            description={
              profile?.resume_url
                ? 'Resume uploaded — parsed on scoring'
                : 'Upload your resume to get this factor scored'
            }
          />
          <FactorBar
            label="Overall Score"
            icon={BarChart3}
            value={score}
            maxValue={100}
            color="text-green-600 dark:text-green-400"
            description="Final weighted score from XGBoost model"
          />
        </div>
      </div>

      {/* How scoring works */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          How Scoring Works
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Github,
              label: 'GitHub Analysis',
              desc: 'Repos, stars, commits, languages, and contribution frequency',
              color: 'bg-slate-50 dark:bg-slate-900',
            },
            {
              icon: Code2,
              label: 'LeetCode Analysis',
              desc: 'Problems solved, difficulty distribution, acceptance rate, ranking',
              color: 'bg-amber-50 dark:bg-amber-950/30',
            },
            {
              icon: FileText,
              label: 'Resume Analysis',
              desc: 'Skills, experience, education, certifications parsed by AI',
              color: 'bg-brand-50 dark:bg-brand-950/30',
            },
          ].map(item => (
            <div
              key={item.label}
              className={`rounded-lg p-4 ${item.color}`}
            >
              <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 mb-2" strokeWidth={1.75} />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {item.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Where real data plugs in — comment for developer */}
      {/*
        ML INTEGRATION POINTS (Day 2-3):
        1. Add shap_values JSON column to users table
        2. After scoring runs, update:
           - users.ranking_score = final_score
           - users.shap_values = { github: X, leetcode: Y, resume: Z }
        3. Update getProfile() response to include shap_values
        4. In FactorBar components, replace null values with:
           - profile.shap_values?.github
           - profile.shap_values?.leetcode
           - profile.shap_values?.resume
        5. The ScoreRing will auto-populate when ranking_score is set
      */}
    </div>
  )
}