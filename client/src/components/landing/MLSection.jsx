import { motion } from 'framer-motion'
import { CheckCircle2, Cpu, GitBranch, Shield } from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const pipelineLayers = [
  { label: 'Input Layer', items: ['GitHub API', 'StackOverflow API', 'Resume Parser'] },
  { label: 'Feature Layer', items: ['Skill vectors', 'Activity metrics', 'Experience encoding'] },
  { label: 'Model Layer', items: ['XGBoost Classifier', 'Cross-validation', 'Hyperparameter tuning'] },
  { label: 'Output Layer', items: ['Suitability score', 'Ranked list', 'SHAP explanations'] },
]

const highlights = [
  'Handles heterogeneous data from three independent sources',
  'XGBoost captures non-linear feature interactions effectively',
  'SHAP values provide per-candidate feature attribution',
  'Designed for reproducibility and academic evaluation',
]

export default function MLSection() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-500">
              Machine Learning Architecture
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Built on XGBoost with explainable AI
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Multistack Hire uses gradient boosting to learn patterns from
              multi-stack developer profiles. SHAP (SHapley Additive exPlanations)
              ensures every ranking decision is auditable and defensible.
            </p>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mt-8 space-y-3"
            >
              {highlights.map((item) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-500" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Model Pipeline</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">XGBoost · SHAP · Python</p>
              </div>
            </div>

            <div className="space-y-4">
              {pipelineLayers.map((layer, index) => (
                <motion.div
                  key={layer.label}
                  variants={fadeUp}
                  className="relative"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {layer.label}
                    </p>
                  </div>
                  <div className="ml-10 mt-2 flex flex-wrap gap-2">
                    {layer.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {index < pipelineLayers.length - 1 && (
                    <div className="ml-3 mt-2 flex h-4 items-center">
                      <GitBranch className="h-3.5 w-3.5 rotate-90 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/50">
              <Shield className="h-4 w-4 text-brand-600 dark:text-brand-500" />
              <p className="text-xs text-brand-800 dark:text-brand-300">
                Model outputs include confidence intervals and feature importance rankings.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
