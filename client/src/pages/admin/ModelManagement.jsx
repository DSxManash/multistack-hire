// client/src/pages/admin/ModelManagement.jsx

import { useState } from 'react'
import {
  Brain,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  BarChart3,
  Code2,
  FileText
} from 'lucide-react'

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
    <div className="space-y-6 max-w-3xl">

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
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                XGBoost Ranking Model
              </p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
                modelStatus.status === 'trained'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
              }`}>
                <Clock className="h-3 w-3" />
                {modelStatus.status === 'trained' ? 'Trained' : 'Not Yet Trained'}
              </span>
            </div>
          </div>

          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {isRetraining
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Training...</>
              : <><Play className="h-4 w-4" /> Train Model</>
            }
          </button>
        </div>

        {retrainMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            <Info className="h-4 w-4 shrink-0" />
            {retrainMsg}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {[
            { label: 'Model Version', value: modelStatus.version ?? '—' },
            { label: 'Last Trained', value: modelStatus.lastTrained ?? '—' },
            { label: 'Candidates Scored', value: modelStatus.totalScored },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline status */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          ML Pipeline Components
        </h3>
        <div className="space-y-3">
          {pipeline.map((step, i) => (
            <div
              key={step.label}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                step.status === 'ready'
                  ? 'bg-green-50 dark:bg-green-950'
                  : 'bg-amber-50 dark:bg-amber-950'
              }`}>
                <step.icon className={`h-4 w-4 ${
                  step.status === 'ready'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                step.status === 'ready'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
              }`}>
                {step.status === 'ready' ? 'Ready' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration note */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/30">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-brand-800 dark:text-brand-300">
              ML Integration Phase
            </p>
            <p className="mt-1 text-xs text-brand-700 dark:text-brand-400">
              The ranking pipeline connects to
              ML to trigger scoring
              for all candidates. Results are stored in
              users.ranking_score and displayed on candidate
              and recruiter dashboards automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}