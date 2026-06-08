import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Database,
  Eye,
  Layers,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const steps = [
  {
    icon: Database,
    title: 'Data Sources',
    description: 'GitHub, StackOverflow, and CV inputs',
  },
  {
    icon: SlidersHorizontal,
    title: 'Feature Engineering',
    description: 'Normalize and encode multi-source signals',
  },
  {
    icon: BarChart3,
    title: 'Score Generation',
    description: 'Compute weighted component scores',
  },
  {
    icon: Layers,
    title: 'XGBoost Model',
    description: 'Predict overall candidate suitability',
  },
  {
    icon: Trophy,
    title: 'Candidate Ranking',
    description: 'Order candidates by predicted fit',
  },
  {
    icon: Eye,
    title: 'SHAP Insights',
    description: 'Explain top contributing features',
  },
]

export default function Workflow() {
  return (
    <section id="workflow" className="border-t border-slate-200 bg-slate-50 py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-500">
            Evaluation Pipeline
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            From raw data to ranked shortlists
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            A transparent six-stage workflow designed for academic rigor and
            recruiter usability.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-14"
        >
          <div className="hidden items-start gap-2 lg:flex">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-1 items-start gap-2">
                <motion.div
                  variants={fadeUp}
                  className="flex-1 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-500">
                    <step.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex shrink-0 items-center justify-center pt-8">
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 lg:hidden">
            {steps.map((step, index) => (
              <div key={step.title}>
                <motion.div
                  variants={fadeUp}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-500">
                    <step.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-600 dark:text-brand-500">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-4 w-4 rotate-90 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
