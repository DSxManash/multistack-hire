import { motion } from 'framer-motion'
import { Brain, Code2, FolderGit2, Users } from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const stats = [
  {
    icon: Users,
    value: '12,400+',
    label: 'Candidate Evaluations',
    description: 'Profiles parsed and ranked across engineering roles.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'group-hover:border-blue-500/50'
  },
  {
    icon: FolderGit2,
    value: '58,000+',
    label: 'GitHub Metrics Tracked',
    description: 'Commits, repository history, and tech stack diversity analyzed.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'group-hover:border-emerald-500/50'
  },
  {
    icon: Code2,
    value: '31,200+',
    label: 'LeetCode Solutions Checked',
    description: 'Algorithmic efficiency, problem difficulties, and categories scored.',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'group-hover:border-amber-500/50'
  },
  {
    icon: Brain,
    value: '94.2%',
    label: 'XGBoost Prediction Accuracy',
    description: 'Tested and validated against recruiter selection benchmarks.',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    borderColor: 'group-hover:border-violet-500/50'
  },
]

export default function Stats() {
  return (
    <section className="relative border-y border-slate-200 bg-slate-50/50 py-16 dark:border-slate-800/80 dark:bg-slate-900/10">

      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/30"
            >
              {/* Colored Glow effect */}
              <div className="absolute -inset-px rounded-2xl border border-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:group-hover:bg-gradient-to-r dark:group-hover:from-brand-500/10 dark:group-hover:to-blue-500/10" />

              <div className="relative z-10">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${stat.bgColor} ${stat.color} group-hover:scale-105`}>
                  <stat.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
                  {stat.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
