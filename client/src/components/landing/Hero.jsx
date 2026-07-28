import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, Sparkles, Code2, FileText, CheckCircle2, Cpu } from 'lucide-react'
import { fadeUp } from './motion'

const mockCandidates = [
  {
    name: 'Alex Chen',
    role: 'Senior Backend Engineer',
    score: '96.4%',
    github: '2.4k commits',
    leetcode: 'Guardian (2340)',
    cvMatch: '95% Keyword Match',
    avatarColor: 'bg-emerald-500',
    metrics: { git: 95, code: 98, cv: 96 }
  },
  {
    name: 'Sarah Jenkins',
    role: 'Full Stack Engineer',
    score: '91.8%',
    github: '1.8k commits',
    leetcode: 'Knight (1950)',
    cvMatch: '90% Keyword Match',
    avatarColor: 'bg-blue-500',
    metrics: { git: 89, code: 92, cv: 94 }
  },
  {
    name: 'Marcus Vance',
    role: 'Machine Learning Engineer',
    score: '88.5%',
    github: '980 commits',
    leetcode: '450 Solved',
    cvMatch: '89% Keyword Match',
    avatarColor: 'bg-violet-500',
    metrics: { git: 85, code: 87, cv: 92 }
  }
]

export default function Hero() {
  const [selectedCandidate, setSelectedCandidate] = useState(0)
  const [syncStatus, setSyncStatus] = useState('Idle')

  // Simulate dashboard background activity
  useEffect(() => {
    const statuses = ['Fetching GitHub commits...', 'Analyzing LeetCode ranks...', 'Parsing CV text...', 'Running XGBoost model...', 'Scores updated!']
    let i = 0
    const interval = setInterval(() => {
      setSyncStatus(statuses[i])
      i = (i + 1) % statuses.length
    }, 4000)
    return () => clearInterval(interval)
  }, [])

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

          {/* Interactive Candidate Dashboard Mockup (Right Column) */}
          <div className="lg:col-span-6">
            <motion.div
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              {/* Header inside mockup */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live Demo Workspace
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                  <Cpu className="h-3 w-3 text-brand-500" />
                  <span className="font-mono">{syncStatus}</span>
                </div>
              </div>

              {/* Main inner grid */}
              <div className="grid gap-5 sm:grid-cols-12">
                
                {/* Candidates List Column */}
                <div className="space-y-3 sm:col-span-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">
                    Ranked Candidates
                  </p>
                  <div className="space-y-2">
                    {mockCandidates.map((cand, idx) => (
                      <button
                        key={cand.name}
                        onClick={() => setSelectedCandidate(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-300 ${
                          selectedCandidate === idx
                            ? 'border-brand-500 bg-brand-50/50 shadow-sm dark:border-brand-500/50 dark:bg-brand-950/20'
                            : 'border-slate-100 hover:border-slate-200 bg-transparent dark:border-slate-800/60 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-full ${cand.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                            {cand.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                              {cand.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {cand.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
                            {cand.score}
                          </p>
                          <p className="text-[8px] text-slate-400">Match</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score breakdown detail card */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:col-span-6 dark:border-slate-800/50 dark:bg-slate-950/50">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedCandidate}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="h-full flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            XGBoost Score Profile
                          </h3>
                          <span className="inline-flex items-center gap-1 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                            Rank #{selectedCandidate + 1}
                          </span>
                        </div>
                        
                        <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {mockCandidates[selectedCandidate].name}
                        </p>
                        
                        <div className="mt-3.5 space-y-2.5">
                          {/* GitHub stat */}
                          <div>
                            <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Code2 className="h-3 w-3" /> GitHub Metric
                              </span>
                              <span>{mockCandidates[selectedCandidate].metrics.git}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${mockCandidates[selectedCandidate].metrics.git}%` }}
                              />
                            </div>
                            <p className="mt-0.5 text-[9px] text-slate-400">
                              {mockCandidates[selectedCandidate].github}
                            </p>
                          </div>

                          {/* LeetCode stat */}
                          <div>
                            <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Code2 className="h-3 w-3" /> LeetCode score
                              </span>
                              <span>{mockCandidates[selectedCandidate].metrics.code}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${mockCandidates[selectedCandidate].metrics.code}%` }}
                              />
                            </div>
                            <p className="mt-0.5 text-[9px] text-slate-400">
                              {mockCandidates[selectedCandidate].leetcode}
                            </p>
                          </div>

                          {/* CV Match stat */}
                          <div>
                            <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" /> CV analysis
                              </span>
                              <span>{mockCandidates[selectedCandidate].metrics.cv}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                                style={{ width: `${mockCandidates[selectedCandidate].metrics.cv}%` }}
                              />
                            </div>
                            <p className="mt-0.5 text-[9px] text-slate-400">
                              {mockCandidates[selectedCandidate].cvMatch}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> Verified by XGBoost model
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
