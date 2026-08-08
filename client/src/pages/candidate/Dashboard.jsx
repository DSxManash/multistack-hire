import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { getCandidateStats, getProfileCompletion } from '../../api/candidateApi'
import {
  User, FileText, BarChart3, Briefcase,
  ArrowRight, Upload, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Circle, Loader2
} from 'lucide-react'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
}

function StatCard({ icon: Icon, label, value, sub, color = 'brand', progressValue = null }) {
  const colors = {
    brand:  'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  }

  const borderGlows = {
    brand:  'hover:border-brand-300 dark:hover:border-brand-850 hover:shadow-brand-500/5',
    green:  'hover:border-green-300 dark:hover:border-green-850 hover:shadow-green-500/5',
    amber:  'hover:border-amber-300 dark:hover:border-amber-850 hover:shadow-amber-500/5',
    purple: 'hover:border-purple-300 dark:hover:border-purple-850 hover:shadow-purple-500/5',
  }

  return (
    <motion.div
      variants={itemVariants}
      className={`group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 transition-all duration-350 hover:-translate-y-1 hover:shadow-xl ${borderGlows[color]}`}
    >
      <div className="flex justify-between items-start">
        {progressValue !== null ? (
          <div className="relative flex h-12 w-12 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-slate-100 dark:stroke-slate-800/80 fill-none"
                strokeWidth="3.5"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-brand-600 dark:stroke-brand-500 fill-none transition-all duration-500 ease-out"
                strokeWidth="3.5"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * progressValue) / 100}
                strokeLinecap="round"
              />
            </svg>
            <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400 relative z-10" strokeWidth={2} />
          </div>
        ) : (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${colors[color]} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      {sub && <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{sub}</p>}
    </motion.div>
  )
}

function ActivityItem({ text, time, status }) {
  const statusConfig = {
    done:    {
      icon: CheckCircle2,
      colorClass: 'text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    },
    pending: {
      icon: Clock,
      colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    },
    info:    {
      icon: Circle,
      colorClass: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800',
    },
    warning: {
      icon: AlertCircle,
      colorClass: 'text-red-500 bg-red-55 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    },
  }
  
  const config = statusConfig[status] || statusConfig.info
  const Icon = config.icon

  return (
    <div className="relative pl-8 pb-1 last:pb-0">
      {/* Node indicator */}
      <div className={`absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${config.colorClass}`}>
        <Icon className="h-3 w-3" />
      </div>
      
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{text}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {time}
        </p>
      </div>
    </div>
  )
}

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.allSettled([getCandidateStats(), getProfileCompletion()])
      .then(([statsRes, completionRes]) => {
        if (!isMounted) return
        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
        if (completionRes.status === 'fulfilled') setCompletion(completionRes.value)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const statCards = [
    {
      icon: User,
      label: 'Profile Completion',
      value: completion ? `${completion.percentage}%` : '—',
      sub: completion?.completed
        ? 'Profile complete'
        : `${completion?.missing?.length ?? 0} fields remaining`,
      color: 'brand',
      progressValue: completion ? completion.percentage : 0,
    },
    {
      icon: FileText,
      label: 'Resume Status',
      value: stats?.resume_uploaded ? 'Uploaded' : 'Missing',
      sub: stats?.resume_uploaded
        ? 'Resume on file'
        : 'Upload to get scored',
      color: stats?.resume_uploaded ? 'green' : 'amber',
    },
    {
      icon: BarChart3,
      label: 'Ranking Score',
      value: stats?.ranking_score != null
        ? `${stats.ranking_score}/100`
        : '—',
      sub: stats?.ranking_score != null
        ? 'AI-generated score'
        : 'Upload resume to get scored',
      color: 'purple',
    },
    {
      icon: Briefcase,
      label: 'Jobs Applied',
      value: stats?.jobs_applied ?? '—',
      sub: stats?.jobs_applied === 0
        ? 'Browse open positions'
        : `${stats?.jobs_applied} application${stats?.jobs_applied !== 1 ? 's' : ''}`,
      color: 'amber',
    },
  ]

  const activity = [
    {
      text: 'Account created successfully',
      time: 'Registration complete',
      status: 'done',
    },
    {
      text: stats?.resume_uploaded
        ? 'Resume uploaded successfully'
        : 'Resume not yet uploaded',
      time: stats?.resume_uploaded ? 'On file' : 'Pending action',
      status: stats?.resume_uploaded ? 'done' : 'warning',
    },
    {
      text: completion?.completed
        ? 'Profile completed'
        : 'Profile incomplete',
      time: completion?.completed
        ? 'Ready to apply'
        : `Missing: ${completion?.missing?.slice(0, 2).join(', ')}`,
      status: completion?.completed ? 'done' : 'pending',
    },
    {
      text: stats?.ranking_score != null
        ? `Ranking score: ${stats.ranking_score}/100`
        : 'ML ranking score not generated yet',
      time: stats?.ranking_score != null
        ? 'AI scored'
        : 'Waiting for resume',
      status: stats?.ranking_score != null ? 'done' : 'info',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-brand-600 dark:border-t-brand-500 animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Loading workspace...
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-brand-100/30 p-8 shadow-sm dark:border-slate-800/80 dark:from-slate-950 dark:via-indigo-950/20 dark:to-brand-950/10"
      >
        {/* Glowing Orbs */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-500/10 animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/5"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Candidate Workspace
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-purple-400">{user?.full_name?.split(' ')[0]}</span> 👋
            </h2>
            <p className="max-w-2xl text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              {completion?.completed
                ? 'Your profile is fully configured. You are ready to apply for matching positions.'
                : 'Complete your profile details and upload your latest resume to receive your AI-powered ranking and stand out to recruiters.'}
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-3">
            {!completion?.completed && (
              <Link
                to="/candidate/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/25 hover:from-brand-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
              >
                Complete Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent activity */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Your latest actions and updates
          </p>
          
          <div className="relative mt-4 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            {activity.map((a, i) => (
              <ActivityItem key={i} {...a} />
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Complete these steps to improve your ranking
          </p>
          
          <div className="space-y-3">
            {[
              {
                to: '/candidate/profile',
                icon: Upload,
                bg: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
                border: 'hover:border-brand-400 dark:hover:border-brand-850 hover:bg-brand-50/10 dark:hover:bg-brand-950/10',
                title: 'Upload Resume',
                sub: 'PDF format, max 5MB',
              },
              {
                to: '/candidate/profile',
                icon: User,
                bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
                border: 'hover:border-purple-400 dark:hover:border-purple-850 hover:bg-purple-50/10 dark:hover:bg-purple-950/10',
                title: 'Complete Profile',
                sub: 'Add GitHub & StackOverflow',
              },
              {
                to: '/candidate/jobs',
                icon: Briefcase,
                bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
                border: 'hover:border-amber-400 dark:hover:border-amber-850 hover:bg-amber-50/10 dark:hover:bg-amber-950/10',
                title: 'Browse Jobs',
                sub: 'Apply to open positions',
              },
              {
                to: '/candidate/ranking',
                icon: TrendingUp,
                bg: 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400',
                border: 'hover:border-green-400 dark:hover:border-green-850 hover:bg-green-50/10 dark:hover:bg-green-950/10',
                title: 'View My Ranking',
                sub: 'AI-powered score breakdown',
              },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`group flex items-center justify-between rounded-xl border border-slate-200/80 p-4 bg-white dark:border-slate-800 dark:bg-slate-950/50 transition-all duration-300 ${action.border}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-350 group-hover:scale-110 shadow-sm ${action.bg}`}>
                    <action.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {action.sub}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-350 group-hover:translate-x-1.5 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hiring section */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Open Positions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Latest job opportunities matching your stacks
            </p>
          </div>
          <Link
            to="/candidate/jobs"
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white/30 py-8 px-4 text-center dark:border-slate-800 dark:from-slate-900/30 dark:to-slate-950/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 relative">
            <span className="absolute -inset-1 rounded-full bg-brand-500/5 animate-pulse"></span>
            <Briefcase className="h-6 w-6" strokeWidth={2} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {stats?.jobs_applied > 0
              ? `You have actively applied to ${stats.jobs_applied} position${stats.jobs_applied !== 1 ? 's' : ''}`
              : 'Start your application journey'
            }
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {stats?.jobs_applied > 0
              ? 'Our ML algorithms are matching your profile with new recruiters.'
              : 'Browse open roles tailored to your professional skills and ranking.'}
          </p>
          <Link
            to="/candidate/jobs"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/10 hover:from-brand-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
          >
            Browse Open Roles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}