import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, Sparkles, Code2, FileText, CheckCircle2, Cpu, GitBranch } from 'lucide-react'
import { fadeUp } from './motion'

/** Illustrative candidates: one model score + raw source features (matches Ranking UI). */
const demoCandidates = [
  {
    name: 'Alex Chen',
    role: 'Backend Engineer',
    score: 92.4,
    avatarColor: 'bg-emerald-500',
    github: { followers: 148, repos: 42, languages: 8, ageDays: 1820 },
    leetcode: { easy: 120, medium: 85, hard: 24 },
    cv: { skills: 18, projects: 6, internships: 2, certifications: 3, cgpa: 3.7 },
  },
  {
    name: 'Sarah Jenkins',
    role: 'Full Stack Engineer',
    score: 86.1,
    avatarColor: 'bg-blue-500',
    github: { followers: 96, repos: 31, languages: 6, ageDays: 1240 },
    leetcode: { easy: 95, medium: 62, hard: 12 },
    cv: { skills: 14, projects: 4, internships: 1, certifications: 2, cgpa: 3.5 },
  },
  {
    name: 'Marcus Vance',
    role: 'ML Engineer',
    score: 81.5,
    avatarColor: 'bg-violet-500',
    github: { followers: 210, repos: 28, languages: 7, ageDays: 2100 },
    leetcode: { easy: 70, medium: 48, hard: 18 },
    cv: { skills: 22, projects: 5, internships: 3, certifications: 4, cgpa: 3.8 },
  },
]

const pipelineStatuses = [
  'Fetching GitHub profile...',
  'Fetching LeetCode stats...',
  'Parsing CV from storage...',
  'Building feature vector...',
  'Running XGBoost model...',
  'Scores updated!',
]

export default function Hero() {
  const [selectedCandidate, setSelectedCandidate] = useState(0)
  const [syncStatus, setSyncStatus] = useState(pipelineStatuses[0])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % pipelineStatuses.length
      setSyncStatus(pipelineStatuses[i])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const active = demoCandidates[selectedCandidate]

  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-32 dark:bg-slate-950">
      {/* Decorative Gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white dark:from-slate-900/30 dark:via-slate-950 dark:to-slate-950" />

      {/* Soft ambient background lights */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-500/5" />
      <div className="absolute bottom-10 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/5" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Headline and Description (Left Column) */}
          <div className="text-center lg:col-span-6 lg:text-left">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/70 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-900/50 dark:bg-brand-950/40 dark:text-brand-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              Academic HR-Tech &amp; Machine Learning Research
            </motion.div>

            <motion.h1
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.1]"
            >
              AI-Powered Candidate{' '}
              <span className="bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-blue-400">
                Ranking System
              </span>
            </motion.h1>

            <motion.p
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400"
            >
              Multistack Hire evaluates software engineering talent by blending
              real-time <strong>GitHub</strong> commits, <strong>LeetCode</strong> algorithmic performance,
              and <strong>CV analytics</strong> into a unified XGBoost machine learning pipeline. Stop guess-hiring and start relying on transparent, data-driven suitability metrics.
            </motion.p>

            <motion.div
              custom={0.3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:-translate-y-[1px] active:translate-y-[0px] dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                Start Evaluating Candidates
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#workflow"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-brand-200 hover:bg-slate-50 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-brand-800 dark:hover:bg-slate-900 dark:hover:text-brand-400"
              >
                <BarChart3 className="h-4 w-4" />
                View Pipeline
              </a>
            </motion.div>
          </div>

          {/* Interactive Candidate Dashboard (Right Column) */}
          <div className="lg:col-span-6">
            <motion.div
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl sm:p-5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              {/* Workspace chrome */}
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500 animate-pulse" />
                  <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live Demo Workspace
                  </span>
                </div>
                <div className="flex max-w-[55%] shrink-0 items-center gap-1.5 truncate rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-400 sm:max-w-none sm:text-[11px]">
                  <Cpu className="h-3 w-3 shrink-0 text-brand-500" />
                  <span className="truncate font-mono">{syncStatus}</span>
                </div>
              </div>

              <div className="grid items-stretch gap-3 sm:grid-cols-12 sm:gap-4">
                {/* Ranked Candidates — compact list */}
                <div className="flex flex-col sm:col-span-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Ranked Candidates
                  </p>
                  <div className="flex flex-1 flex-col gap-1.5">
                    {demoCandidates.map((cand, idx) => (
                      <button
                        key={cand.name}
                        type="button"
                        onClick={() => setSelectedCandidate(idx)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2.5 text-left transition-all duration-300 ${selectedCandidate === idx
                            ? 'border-brand-500 bg-brand-50/60 shadow-sm dark:border-brand-500/50 dark:bg-brand-950/30'
                            : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-slate-700'
                          }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cand.avatarColor} text-[11px] font-bold text-white`}>
                            {cand.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                              {cand.name}
                            </p>
                            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                              {cand.role}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold tabular-nums text-brand-600 dark:text-brand-400">
                            {cand.score}
                          </p>
                          <p className="text-[8px] uppercase tracking-wide text-slate-400">AI Score</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected candidate workspace */}
                <div className="flex flex-col rounded-xl border border-slate-200/90 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50 sm:col-span-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedCandidate}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="flex h-full flex-col p-3 sm:p-3.5"
                    >
                      {/* AI Score Profile */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            AI Score Profile
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {active.name}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                          Rank #{selectedCandidate + 1}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              Suitability score
                            </p>
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          </div>
                          <div className="mt-0.5 flex items-baseline gap-1">
                            <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                              {active.score}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">/100</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-brand-600 transition-all duration-500"
                              style={{ width: `${Math.min(100, active.score)}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[9px] leading-snug text-slate-400">
                            One XGBoost prediction from a 12-feature vector
                          </p>
                        </div>
                      </div>

                      {/* Profile Summary — stacked source rows, no cramped columns */}
                      <div className="mt-2.5 rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-3 py-1.5 dark:border-slate-800">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Profile Summary
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          <div className="px-3 py-2">
                            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                              <GitBranch className="h-3 w-3 shrink-0" />
                              GitHub
                            </p>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[
                                { label: 'Followers', value: active.github.followers },
                                { label: 'Repos', value: active.github.repos },
                                { label: 'Languages', value: active.github.languages },
                                { label: 'Age (days)', value: active.github.ageDays },
                              ].map((s) => (
                                <div
                                  key={s.label}
                                  className="min-w-0 rounded-md bg-slate-50 px-1.5 py-1.5 text-center dark:bg-slate-950/70"
                                >
                                  <p className="truncate text-[11px] font-bold tabular-nums text-slate-900 dark:text-white">
                                    {s.value}
                                  </p>
                                  <p className="mt-0.5 truncate text-[8px] leading-none text-slate-400">
                                    {s.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="px-3 py-2">
                            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                              <Code2 className="h-3 w-3 shrink-0 text-amber-600" />
                              LeetCode
                            </p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { label: 'Easy', value: active.leetcode.easy },
                                { label: 'Medium', value: active.leetcode.medium },
                                { label: 'Hard', value: active.leetcode.hard },
                              ].map((s) => (
                                <div
                                  key={s.label}
                                  className="min-w-0 rounded-md bg-slate-50 px-1.5 py-1.5 text-center dark:bg-slate-950/70"
                                >
                                  <p className="truncate text-[11px] font-bold tabular-nums text-slate-900 dark:text-white">
                                    {s.value}
                                  </p>
                                  <p className="mt-0.5 truncate text-[8px] leading-none text-slate-400">
                                    {s.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="px-3 py-2">
                            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                              <FileText className="h-3 w-3 shrink-0 text-brand-600" />
                              Resume
                            </p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { label: 'Skills', value: active.cv.skills },
                                { label: 'Projects', value: active.cv.projects },
                                { label: 'CGPA', value: active.cv.cgpa },
                              ].map((s) => (
                                <div
                                  key={s.label}
                                  className="min-w-0 rounded-md bg-slate-50 px-1.5 py-1.5 text-center dark:bg-slate-950/70"
                                >
                                  <p className="truncate text-[11px] font-bold tabular-nums text-slate-900 dark:text-white">
                                    {s.value}
                                  </p>
                                  <p className="mt-0.5 truncate text-[8px] leading-none text-slate-400">
                                    {s.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
