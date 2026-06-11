import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Layers,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  Briefcase,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { fadeUp } from '../../components/landing/motion'

function getRoleDashboard(role) {
  const map = {
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard',
    candidate: '/candidate/dashboard',
  }
  return map[role] ?? '/'
}

const roles = [
  {
    value: 'candidate',
    label: 'Candidate',
    description: 'Looking for opportunities',
    icon: UserCheck,
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    description: 'Hiring technical talent',
    icon: Briefcase,
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'candidate',
  })

  function handleChange(e) {
    clearError()
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const user = await register(formData)
      navigate(getRoleDashboard(user.role), { replace: true })
    } catch {
      // handled by AuthContext
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 dark:bg-slate-950">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Layers className="h-5 w-5" strokeWidth={2} />
            </span>

            <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Multistack
              <span className="text-brand-600 dark:text-brand-500">
                Hire
              </span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create your account
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Join Multistack Hire to get started
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />

              <p className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Full name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="gmail@example.com"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                     <Eye className="h-4 w-4" />
                    
                  ) : (
                   <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                I am a...
              </p>

              <div className="grid grid-cols-2 gap-3">
                {roles.map(({ value, label, description, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors ${
                      formData.role === value
                        ? 'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={formData.role === value}
                      onChange={handleChange}
                      className="sr-only"
                    />

                    <Icon
                      className={`h-5 w-5 ${
                        formData.role === value
                          ? 'text-brand-600 dark:text-brand-500'
                          : 'text-slate-400'
                      }`}
                    />

                    <span
                      className={`text-sm font-semibold ${
                        formData.role === value
                          ? 'text-brand-700 dark:text-brand-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {label}
                    </span>

                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}