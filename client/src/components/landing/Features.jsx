import { motion } from 'framer-motion'
import {
  BarChart3,
  Cpu,
  Eye,
  FileText,
  Code2,
  MessageSquare,
} from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const features = [
  {
    icon: Code2,
    title: 'GitHub Analysis',
    description:
      'Extracts repository quality, commit frequency, language diversity, and open-source impact to quantify real-world coding experience.',
  },
  {
    icon: MessageSquare,
    title: 'StackOverflow Analysis',
    description:
      'Measures community reputation, answer quality, and domain expertise across technology tags relevant to the role.',
  },
  {
    icon: FileText,
    title: 'Resume Assessment',
    description:
      'Parses CVs to identify skills, education, certifications, and project history aligned with job requirements.',
  },
  {
    icon: BarChart3,
    title: 'Candidate Scoring',
    description:
      'Aggregates multi-source signals into normalized feature vectors for fair, comparable candidate evaluation.',
  },
  {
    icon: Cpu,
    title: 'XGBoost Prediction',
    description:
      'Gradient-boosted models predict candidate suitability scores trained on historical hiring outcomes.',
  },
  {
    icon: Eye,
    title: 'SHAP Explainability',
    description:
      'Provides interpretable feature attributions so recruiters understand why each candidate received their rank.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
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
            Platform Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            End-to-end candidate intelligence
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Every data source is transformed into actionable insights through a
            structured, reproducible evaluation framework.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={fadeUp}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:shadow-slate-900/50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:border-brand-900 dark:bg-brand-950 dark:text-brand-500 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
