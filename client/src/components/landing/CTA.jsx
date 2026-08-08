import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { fadeUp } from './motion'

export default function CTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden dark:bg-slate-950">

      {/* Decorative ambient spots */}
      <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/5" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-600 via-brand-650 to-blue-700 px-8 py-16 text-center sm:px-16 dark:border-brand-900/60 dark:from-brand-950/80 dark:via-brand-950/40 dark:to-slate-900/60"
        >
          {/* Inner ambient lights */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-2xl dark:bg-brand-500/10" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl dark:bg-blue-500/10" />

          <div className="relative z-10">

            {/* Sparkles tag */}
            <div className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 dark:bg-brand-950/80 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5 text-brand-200 dark:text-brand-400" />
              Empower Your Tech Recruitment
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to Evaluate Your Next Hire?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-brand-100 dark:text-slate-350 leading-relaxed">
              Sync candidates’ GitHub contributions and LeetCode performance, upload resumes, and let Multistack Hire output transparent suitability rankings.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-700 shadow-md transition-all hover:bg-slate-50 hover:shadow-[0_4px_16px_rgba(255,255,255,0.2)] hover:-translate-y-[1px] active:translate-y-[0px] dark:bg-brand-600 dark:text-white dark:hover:bg-brand-700 dark:hover:shadow-[0_4px_16px_rgba(37,99,235,0.3)]"
              >
                Evaluate Candidates Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="text-sm font-semibold text-white/90 hover:text-white transition-colors duration-200 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Explore all features
              </a>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
