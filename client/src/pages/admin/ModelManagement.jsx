// client/src/pages/admin/ModelManagement.jsx

import { useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import {
  Brain,
  BarChart3,
  Code2,
  FileText,
  Loader2,
  Target,
  Database,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const statusStyles = {
  ready:
    'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
  pending:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
  trained:
    'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
}

const MODEL_METADATA = {
  algorithm: 'XGBoost Regressor',
  datasetSize: '2,000 Candidate Profiles',
  predictionTarget: 'Candidate Ranking Score (0–100)',
  inputFeatures: '12 Features',
  mae: '1.831',
  rmse: '2.43',
  rSquared: '0.98',
  features: [
    'GitHub Followers',
    'Public Repositories',
    'Language Diversity',
    'GitHub Account Age',
    'LeetCode Easy Solved',
    'LeetCode Medium Solved',
    'LeetCode Hard Solved',
    'Resume Skills',
    'Resume Projects',
    'Internships',
    'Certifications',
    'CGPA',
  ],
}

function MetricCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-5 text-center dark:bg-slate-800/50">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  )
}

export default function ModelManagement() {
  const [scoringAll, setScoringAll] = useState(false)
  const [scoreAllResult, setScoreAllResult] = useState(null)
  const [actionMsg, setActionMsg] = useState(null)

  async function handleScoreAll() {
    setScoringAll(true)
    setScoreAllResult(null)
    setActionMsg(null)
    try {
      const response = await axiosInstance.post('/ranking/score/all')
      setScoreAllResult(response.data)
      setActionMsg(`Scored ${response.data.scored} candidates successfully`)
    } catch (err) {
      setActionMsg('Scoring failed: ' + (err.response?.data?.detail || 'Unknown error'))
    } finally {
      setScoringAll(false)
    }
  }

  const pipeline = [
    {
      icon: Brain,
      label: 'GitHub API',
      desc: 'Fetches repos, stars, commits, languages',
      status: 'ready',
    },
    {
      icon: Code2,
      label: 'LeetCode API',
      desc: 'Fetches solved problems, ranking, acceptance rate',
      status: 'ready',
    },
    {
      icon: FileText,
      label: 'Resume Parser',
      desc: 'pdfplumber extracts skills, experience, education',
      status: 'ready',
    },
    {
      icon: BarChart3,
      label: 'XGBoost Model',
      desc: 'Predicts candidate suitability score (0–100)',
      status: 'ready',
    },
  ]

  const metrics = [
    {
      icon: Target,
      label: 'MAE',
      value: MODEL_METADATA.mae,
      sub: 'Mean Absolute Error',
      color: 'amber',
    },
    {
      icon: BarChart3,
      label: 'RMSE',
      value: MODEL_METADATA.rmse,
      sub: 'Root Mean Squared Error',
      color: 'blue',
    },
    {
      icon: Brain,
      label: 'R-Squared',
      value: MODEL_METADATA.rSquared,
      sub: 'Coefficient of determination',
      color: 'green',
    },
    {
      icon: Database,
      label: 'Training Set',
      value: '2,000',
      sub: 'Candidate Profiles',
      color: 'purple',
    },
  ]

  const overview = [
    { label: 'Algorithm', value: MODEL_METADATA.algorithm },
    { label: 'Prediction Target', value: MODEL_METADATA.predictionTarget },
    { label: 'Input Features', value: MODEL_METADATA.inputFeatures },
    { label: 'Training Dataset', value: MODEL_METADATA.datasetSize },
  ]

  return (
    <div className="space-y-6">
      {/* Header — matches admin pages */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          ML Model Management
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage the XGBoost candidate ranking model
        </p>
      </div>

      {/* Top summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Second card — Projects / Jobs-style hierarchy */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        {/* Card header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                Ranking Engine
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles.trained}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Trained
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
              XGBoost Ranking Model
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Predicts candidate suitability from GitHub, LeetCode, and resume signals
            </p>
          </div>

          <button
            type="button"
            onClick={handleScoreAll}
            disabled={scoringAll}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {scoringAll ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Scoring…
              </>
            ) : (
              <>
                <Brain className="h-3.5 w-3.5" />
                Score All Candidates
              </>
            )}
          </button>
        </div>

        {/* Feedback */}
        {scoreAllResult && (
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/20">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {scoreAllResult.scored + scoreAllResult.failed}
              </p>
              <p className="text-xs text-slate-500">Total candidates</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{scoreAllResult.scored}</p>
              <p className="text-xs text-slate-500">Scored</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">{scoreAllResult.failed}</p>
              <p className="text-xs text-slate-500">Failed</p>
            </div>
          </div>
        )}
        {actionMsg && !scoreAllResult && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            <Info className="h-5 w-5 shrink-0" />
            {actionMsg}
          </div>
        )}

        {/* Overview meta — section title + supporting line */}
        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Model overview</h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
            Core configuration for the ranking model
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {overview.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Input features</h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
            Twelve numerical signals used at inference time
          </p>
          <div className="flex flex-wrap gap-2">
            {MODEL_METADATA.features.map((feature) => (
              <span
                key={feature}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/40 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Pipeline — list rows like System Status / Jobs meta */}
        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Scoring pipeline</h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
            Data sources and model stage used for each score
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pipeline.map((step) => (
              <div
                key={step.label}
                className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{step.desc}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[step.status]}`}
                >
                  {step.status === 'ready' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow note */}
        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Model workflow
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Candidate profile data is collected from GitHub, LeetCode, and resume parsing.
            Twelve numerical features are extracted and passed into the trained XGBoost
            regression model. The model predicts a final ranking score between 0 and 100,
            which is stored in{' '}
            <span className="font-mono rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              users.ranking_score
            </span>{' '}
            and displayed across candidate and recruiter dashboards automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
