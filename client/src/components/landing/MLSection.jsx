import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Cpu, GitBranch, Shield, BarChart3, HelpCircle, Layers } from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const pipelineLayers = [
  { label: 'Input Layer', items: ['GitHub API', 'LeetCode API', 'Resume NLP Parser'] },
  { label: 'Feature Layer', items: ['Skill Vectors', 'Activity Metrics', 'Experience Encoding'] },
  { label: 'Model Layer', items: ['XGBoost Classifier', '5-Fold CV', 'Bayesian Tuning'] },
  { label: 'Output Layer', items: ['Suitability Logit', 'Ranked Candidate List'] },
]

const highlights = [
  'Combines heterogeneous code, profile, and text data sources into a unified vector.',
  'Trained gradient boosting trees capture high-order non-linear feature interactions.',
  'Designed for research reproducibility, cross-validation scoring, and fairness benchmarks.',
]

const mockFeaturesImportance = [
  { name: 'LeetCode Problem Depth', pct: 38, color: 'bg-amber-500' },
  { name: 'GitHub Commit Consistency', pct: 28, color: 'bg-emerald-500' },
  { name: 'CV Keyword Recency', pct: 21, color: 'bg-violet-500' },
  { name: 'GitHub Repo Stars / Popularity', pct: 13, color: 'bg-blue-500' },
]

export default function MLSection() {
  const [activeTab, setActiveTab] = useState('importance') // 'importance' | 'pipeline'

  return (
    <section id="about" className="relative py-20 sm:py-28 overflow-hidden dark:bg-slate-950">

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-brand-400/5 blur-3xl dark:bg-brand-500/5" />
      <div className="absolute bottom-1/4 left-0 -z-10 h-96 w-96 rounded-full bg-violet-400/5 blur-3xl dark:bg-violet-500/5" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Information Side (Left) */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              custom={0}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                Machine Learning Architecture
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white leading-[1.15]">
                Built on Gradient Boosting &amp; Explainable AI
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Multistack Hire is engineered to solve developer assessment complexity. Instead of relying on manual resume reviews, our XGBoost classifier scores candidates by learning from validated training history.
              </p>

              <motion.ul
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="mt-8 space-y-4"
              >
                {highlights.map((item) => (
                  <motion.li
                    key={item}
                    variants={fadeUp}
                    className="flex items-start gap-3.5 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </span>
                    <span className="leading-normal">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>

          {/* Visualization Dashboard (Right) */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)]"
            >
              {/* Header inside card */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm dark:bg-brand-500">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">
                      XGBoost Model Diagnostics
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Python 3.11 · Scikit-Learn
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 dark:bg-slate-950">
                  <button
                    onClick={() => setActiveTab('importance')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${activeTab === 'importance'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                  >
                    Feature Importance
                  </button>
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${activeTab === 'pipeline'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                  >
                    Pipeline Layers
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[220px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activeTab === 'importance' ? (
                    <motion.div
                      key="importance-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">
                        <span>Model Feature Weights</span>
                        <span>SHAP Contribution</span>
                      </div>
                      <div className="space-y-3">
                        {mockFeaturesImportance.map((feature) => (
                          <div key={feature.name}>
                            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <span>{feature.name}</span>
                              <span>{feature.pct}%</span>
                            </div>
                            <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className={`h-full rounded-full ${feature.color}`}
                                style={{ width: `${feature.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pipeline-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="space-y-3.5">
                        {pipelineLayers.map((layer, index) => (
                          <div key={layer.label} className="relative">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                                {index + 1}
                              </span>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {layer.label}
                              </p>
                            </div>
                            <div className="ml-9 mt-1 flex flex-wrap gap-1.5">
                              {layer.items.map((item) => (
                                <span
                                  key={item}
                                  className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                            {index < pipelineLayers.length - 1 && (
                              <div className="ml-3 mt-1.5 flex h-3 items-center">
                                <GitBranch className="h-3 w-3 rotate-90 text-slate-350 dark:text-slate-700" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Shield Alert */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3.5 dark:border-brand-900/30 dark:bg-brand-950/40">
                <Shield className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600 dark:text-brand-400" />
                <p className="text-xs text-brand-850 dark:text-brand-300 leading-relaxed">
                  <strong>SHAP Explainability:</strong> Final score matches are backed by SHAP summary values to prevent bias and ensure decision transparency.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
