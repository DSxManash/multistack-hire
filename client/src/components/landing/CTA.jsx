import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp } from './motion'

export default function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="rounded-2xl border border-brand-100 bg-brand-50 px-8 py-14 text-center sm:px-12 dark:border-brand-900 dark:bg-brand-950/30"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Ready to evaluate your next hire?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
            Upload candidate profiles and let Multistack Hire rank technical talent
            using data from GitHub, StackOverflow, and CVs — backed by machine learning.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Evaluate Candidates Now
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Explore all features
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
