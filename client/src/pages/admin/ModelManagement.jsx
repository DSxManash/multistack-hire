// client/src/pages/admin/ModelManagement.jsx

import { useState } from 'react'
import {
  Brain,
  Play,
  RefreshCw,
  Clock,
  Info,
  BarChart3,
  Code2,
  FileText
} from 'lucide-react'

// Centralized badge styling logic to match the dashboard's aesthetic
const statusStyles = {
  ready: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
  trained: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40',
  not_trained: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-200/40 dark:ring-amber-800/40',
}

export default function ModelManagement() {
  const [isRetraining, setIsRetraining] = useState(false)
  const [retrainMsg, setRetrainMsg] = useState(null)

  async function handleRetrain() {
    setIsRetraining(true)
    setRetrainMsg(null)
    // ML INTEGRATION POINT:
    // Call POST /api/v1/ranking/retrain here
    // For now simulate with timeout
    await new Promise(r => setTimeout(r, 2000))
    setRetrainMsg('Retrain endpoint ready — connect ML pipeline to activate')
    setIsRetraining(false)
  }

  const modelStatus = {
    status: 'not_trained',
    version: null,
    lastTrained: null,
    accuracy: null,
    totalScored: 0,
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
      desc: 'Predicts candidate suitability score (0-100)',
      status: 'pending',
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          ML Model Management
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage the XGBoost candidate ranking model
        </p>
      </div>

      {/* Model status card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Card Header */}
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

          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRetraining
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Training...</>
              : <><Play className="h-4 w-4" /> Train Model</>
            }
          </button>
        </div>

        {/* Retrain Message */}
        {retrainMsg && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            <Info className="h-5 w-5 shrink-0" />
            {retrainMsg}
          </div>
        )}

        {/* Dashboard Style Stats Widgets */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Model Version</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {modelStatus.version ?? '—'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Trained</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {modelStatus.lastTrained ?? '—'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Candidates Scored</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {modelStatus.totalScored}
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          ML Pipeline Components
        </h3>
        <div className="space-y-4">
          {pipeline.map((step) => (
            <div
              key={step.label}
              className="group flex items-center gap-4 rounded-lg border border-slate-100 bg-white p-4 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                step.status === 'ready'
                  ? 'bg-green-50 text-green-600 ring-1 ring-green-200/40 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-800/40'
                  : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200/40 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800/40'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[step.status]}`}>
                {step.status === 'ready' ? 'Ready' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration note */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-800 dark:text-brand-300">
              ML Integration Phase
            </p>
            <p className="mt-1 text-sm text-brand-700 dark:text-brand-400">
              The ranking pipeline connects to ML to trigger scoring for all candidates.
              Results are stored in <span className="font-mono font-medium">users.ranking_score</span> and
              displayed on candidate and recruiter dashboards automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}