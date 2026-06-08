import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Sparkles } from 'lucide-react'
import { fadeUp } from './motion'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-300"
          >
            <Sparkles className="h-4 w-4" />
            Final Year Project · HR-Tech &amp; ML Research
          </motion.div>

          <motion.h1
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
          >
            AI-Powered Candidate{' '}
            <span className="text-brand-600 dark:text-brand-500">Ranking System</span>
          </motion.h1>

          <motion.p
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400"
          >
            Multistack Hire evaluates technical talent by combining GitHub activity,
            StackOverflow contributions, and CV analysis into a unified machine learning
            pipeline — delivering transparent, data-driven hiring decisions.
          </motion.p>

          <motion.div
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Start Evaluating Candidates
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#workflow"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-800 dark:hover:text-brand-500"
            >
              <BarChart3 className="h-4 w-4" />
              View Pipeline
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
