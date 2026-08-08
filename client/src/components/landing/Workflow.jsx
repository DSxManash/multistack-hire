import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Trophy,
  SlidersHorizontal,
  Database,
  Cpu,
} from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const steps = [
  {
    icon: Database,
    title: 'Data Ingestion',
    description: 'Integrates public profiles from GitHub and LeetCode, and parses uploaded CV text content.',
    label: 'Data Sources'
  },
  {
    icon: SlidersHorizontal,
    title: 'Feature Extraction',
    description: 'Extracts and normalizes multi-source coding signals into clean numerical vectors.',
    label: 'Feature Engineering'
  },
  {
    icon: BarChart3,
    title: 'Weight Assessment',
    description: 'Calculates customizable weights across individual components to model role priorities.',
    label: 'Score Generation'
  },
  {
    icon: Cpu,
    title: 'XGBoost Prediction',
    description: 'Passes normalized feature vectors through trained models to calculate suitability logits.',
    label: 'Model Inference'
  },
  {
    icon: Trophy,
    title: 'Talent Ranking',
    description: 'Sorts all candidates dynamically, producing a transparent and queryable shortlist.',
    label: 'Candidate Ranking'
  },
]

export default function Workflow() {
  return (
    <section id="workflow" className="relative border-t border-slate-200 bg-slate-50/50 py-20 sm:py-28 dark:border-slate-800/80 dark:bg-slate-900/10">

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            Evaluation Pipeline
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            From Raw Profiles to Ranked Shortlists
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            A pipeline designed for academic rigor, speed, and recruiter clarity.
          </p>
        </motion.div>

        {/* Desktop Pipeline Flow */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-16 hidden lg:block"
        >
          <div className="relative flex items-stretch justify-between gap-3">

            {/* Horizontal Line Background */}
            <div className="absolute top-[28px] left-[5%] right-[5%] h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" />

            {steps.map((step, index) => (
              <div key={step.title} className="flex-1 flex flex-col items-center">

                {/* Step badge / Icon wrapper */}
                <motion.div
                  variants={fadeUp}
                  className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:border-brand-500 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-brand-400 dark:hover:text-brand-400"
                >
                  {/* Step label on hover */}
                  <span className="absolute -top-7 scale-95 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider bg-brand-50/80 px-2 py-0.5 rounded-md dark:bg-brand-950/80 backdrop-blur-sm">
                    Step 0{index + 1}
                  </span>

                  <step.icon className="h-6 w-6" strokeWidth={1.75} />
                </motion.div>

                {/* Content Card */}
                <motion.div
                  variants={fadeUp}
                  className="mt-6 flex-1 rounded-2xl border border-slate-150 bg-white/70 p-5 text-center shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/60"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {step.label}
                  </p>
                  <h3 className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                </motion.div>

              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile / Tablet Vertical Flow */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-16 flex flex-col gap-8 lg:hidden"
        >
          <div className="relative border-l-2 border-slate-200 pl-6 space-y-8 dark:border-slate-800 ml-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="relative"
              >
                {/* Custom circular list bullet indicator */}
                <span className="absolute -left-[37px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm dark:bg-brand-500">
                  {index + 1}
                </span>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {step.label}
                  </span>
                  <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
