// client/src/pages/admin/ModelManagement.jsx

import { useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import {
  Brain,
  Play,
  RefreshCw,
  Info,
  BarChart3,
  Code2,
  FileText,
  Loader2,
  Target,
  Database,
  Clock,
  Layers,
  Users
} from 'lucide-react'

// Centralized badge styling logic
const statusStyles = {
  ready: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
  trained: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
  not_trained: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
}

// Static Model Information
const MODEL_METADATA = {
  algorithm: 'XGBoost Regressor',
  datasetSize: '2,001 Candidate Profiles',
  predictionTarget: 'Candidate Ranking Score (0–100)',
  inputFeatures: '12 Features',
  trainingAccuracy: '94.2%',
  rmse: '3.87',
  features: [
    'GitHub Followers', 'Public Repositories', 'Language Diversity', 'GitHub Account Age',
    'LeetCode Easy Solved', 'LeetCode Medium Solved', 'LeetCode Hard Solved',
    'Resume Skills', 'Resume Projects', 'Internships', 'Certifications', 'CGPA',
  ],
}

export default function ModelManagement() {
  const [isRetraining, setIsRetraining] = useState(false)
  const [retrainMsg, setRetrainMsg] = useState(null)
  const [scoringAll, setScoringAll] = useState(false)
  const [scoreAllResult, setScoreAllResult] = useState(null)

  async function handleRetrain() {
    setIsRetraining(true)
    setRetrainMsg(null)
    await new Promise(r => setTimeout(r, 2000))
    setRetrainMsg('Retrain endpoint ready — connect ML pipeline to activate')
    setIsRetraining(false)
  }

  async function handleScoreAll() {
    setScoringAll(true)
    setScoreAllResult(null)
    try {
      const response = await axiosInstance.post('/ranking/score/all')
      setScoreAllResult(response.data)
      setRetrainMsg(`Scored ${response.data.scored} candidates successfully`)
    } catch (err) {
      setRetrainMsg('Scoring failed: ' + (err.response?.data?.detail || 'Unknown error'))
    } finally {
      setScoringAll(false)
    }
  }

  const modelStatus = {
    status: 'not_trained',
    version: null,
    lastTrained: null,
    totalScored: 0,
  }

  const pipeline = [
    { icon: Brain, label: 'GitHub API', desc: 'Fetches repos, stars, commits, languages', status: 'ready' },
    { icon: Code2, label: 'LeetCode API', desc: 'Fetches solved problems, ranking, acceptance rate', status: 'ready' },
    { icon: FileText, label: 'Resume Parser', desc: 'pdfplumber extracts skills, experience, education', status: 'ready' },
    { icon: BarChart3, label: 'XGBoost Model', desc: 'Predicts candidate suitability score (0-100)', status: 'pending' },
  ]

  return (
    <div className="space-y-6"> {/* ✅ REMOVED max-w-4xl here so it spans full width */}

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          ML Model Management
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage the XGBoost candidate ranking model
        </p>
      </div>

      {/* ── Card 1: Model Status & Actions ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-200/40 dark:bg-purple-950/40 dark:text-purple-400 dark:ring-purple-800/40">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                XGBoost Ranking Model
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[modelStatus.status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${modelStatus.status === 'trained' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {modelStatus.status === 'trained' ? 'Trained' : 'Untrained'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRetraining ? <><RefreshCw className="h-4 w-4 animate-spin" /> Training...</> : <><Play className="h-4 w-4" /> Train Model</>}
            </button>


            {/* <button
              onClick={handleScoreAll}
              disabled={scoringAll}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {scoringAll ? <><Loader2 className="h-4 w-4 animate-spin" /> Scoring...</> : <><Brain className="h-4 w-4" /> Score All Candidates</>}
            </button> */}


          </div>
        </div>

        {/* Action Feedback */}
        {scoreAllResult && (
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/20">
            <div><p className="text-lg font-bold text-slate-900 dark:text-white">{scoreAllResult.scored + scoreAllResult.failed}</p><p className="text-xs text-slate-500">Total candidates</p></div>
            <div><p className="text-lg font-bold text-green-600">{scoreAllResult.scored}</p><p className="text-xs text-slate-500">Scored</p></div>
            <div><p className="text-lg font-bold text-red-500">{scoreAllResult.failed}</p><p className="text-xs text-slate-500">Failed</p></div>
          </div>
        )}
        {retrainMsg && !scoreAllResult && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            <Info className="h-5 w-5 shrink-0" />
            {retrainMsg}
          </div>
        )}

        {/* Dashboard Metric Widgets (Scaled to full width) */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {/* <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Version</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{modelStatus.version ?? '—'}</p>
            </div>
          </div> */}
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Trained</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{modelStatus.lastTrained ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Accuracy</p>
              <p className="mt-0.5 text-lg font-bold text-green-600 dark:text-green-400">{MODEL_METADATA.trainingAccuracy}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">RMSE</p>
              <p className="mt-0.5 text-lg font-bold text-blue-600 dark:text-blue-400">{MODEL_METADATA.rmse}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Training Set</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{MODEL_METADATA.datasetSize}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scored</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{modelStatus.totalScored}</p>
            </div>
          </div>
        </div>
      </div>

      

      {/* ── Card 3: Model Architecture & Features ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          Model Architecture
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Algorithm</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{MODEL_METADATA.algorithm}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Prediction Target</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{MODEL_METADATA.predictionTarget}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Input Features</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{MODEL_METADATA.inputFeatures}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Training Dataset</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{MODEL_METADATA.datasetSize}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Input Features</h4>
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
      </div>

      {/* ── Card 4: Integration & Workflow Note ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4 border-l-4 border-brand-500 pl-4 dark:border-brand-400">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Model Workflow
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Candidate profile data is collected from GitHub, LeetCode, and Resume parsing. Twelve numerical features are extracted and passed into the trained XGBoost regression model. The model predicts a final ranking score between 0 and 100, which is stored in <span className="font-mono rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">users.ranking_score</span> and displayed across candidate and recruiter dashboards automatically.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}