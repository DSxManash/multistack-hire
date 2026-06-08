import { motion } from 'framer-motion'
import { Brain, Code2, MessageSquare, Users } from 'lucide-react'
import { fadeUp, staggerContainer } from './motion'

const stats = [
  {
    icon: Users,
    value: '12,400+',
    label: 'Candidate Evaluations',
    description: 'Profiles assessed across technical roles',
  },
  {
    icon: Code2,
    value: '58,000+',
    label: 'GitHub Metrics',
    description: 'Repositories, commits, and contributions analyzed',
  },
  {
    icon: MessageSquare,
    value: '31,200+',
    label: 'StackOverflow Contributions',
    description: 'Answers, reputation, and tag expertise scored',
  },
  {
    icon: Brain,
    value: '94.2%',
    label: 'Ranking Accuracy',
    description: 'Validated against recruiter shortlist benchmarks',
  },
]

export default function Stats() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
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
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-500">
                <stat.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {stat.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
