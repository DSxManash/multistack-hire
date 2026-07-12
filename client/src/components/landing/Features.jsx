import { motion } from 'framer-motion'
import {
  BarChart3,
  Cpu,
  FileText,
  Code2,
  GitBranch,
  Eye,
} from 'lucide-react'

import { fadeUp, staggerContainer } from './motion'

const features = [
  {
    icon: GitBranch, 
    title: 'GitHub Analysis',
    description:
      'Extracts repository quality, commit frequency, language diversity, and open-source impact to quantify real-world developer contributions.',
    tag: 'GitHub API'
  },
  {
    icon: Code2, 
    title: 'LeetCode Analytics',
    description:
      'Measures algorithmic efficiency, data structures expertise, and coding pace across easy, medium, and hard problem sets.',
    tag: 'LeetCode API'
  },
  {
    icon: FileText,
    title: 'Resume CV Parsing',
    description:
      'Extracts technical skills, years of experience, and educational background from resumes using specialized NLP text filters.',
    tag: 'NLP Parser'
  },
  {
    icon: BarChart3,
    title: 'Candidate Scoring',
    description:
      'Aggregates disparate signals (GitHub, LeetCode, CV) into a standardized multi-dimensional feature vector for bias-free ranking.',
    tag: 'Data Pipeline'
  },
  {
    icon: Cpu,
    title: 'XGBoost Classification',
    description:
      'Utilizes a trained gradient boosting model to predict recruiter suitability scores with high calibration accuracy.',
    tag: 'Machine Learning'
  },
  {
    icon: Eye,
    title: 'Explainable AI Profiles',
    description:
      'Provides clear visual feedback on which metrics (e.g. commits, problem-solving, CV terms) drove the candidate’s final rank.',
    tag: 'Transparency'
  },
]

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28 overflow-hidden dark:bg-slate-950">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 h-72 w-72 rounded-full bg-brand-200/10 blur-3xl dark:bg-brand-900/5" />
      <div className="absolute bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-blue-200/10 blur-3xl dark:bg-blue-900/5" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            Platform Capabilities
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            End-to-end Candidate Intelligence
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Every developer profile is transformed into clean, actionable, and 
            explainable suitability metrics through our automated ML evaluation pipeline.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={fadeUp}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/20 dark:hover:border-slate-700/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-400 dark:group-hover:bg-brand-500 dark:group-hover:text-white">
                  <feature.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <span className="rounded-lg bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  {feature.tag}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
