import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Layers,
  Mail,
  Lock,
  User,
  AlertCircle,
  Briefcase,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getRoleDashboard } from '../../lib/roleHome'
import { fadeUp } from '../../components/landing/motion'
import Button from '../../components/ui/Button'
import BackButton from '../../components/ui/BackButton'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'candidate',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    clearError()
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Validation with strict password requirements
  function validate() {
    const errors = {}

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number'
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character (!@#$...)'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    try {
      const user = await register(formData)
      navigate(getRoleDashboard(user.role), { replace: true })
    } catch {
      // error handled by AuthContext
    }
  }

  // Helper for input className
  function inputClass(field) {
    return `w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
      fieldErrors[field]
        ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-400 focus:ring-red-200 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300'
        : 'border-slate-200 bg-white text-slate-900 focus:border-brand-500 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500'
    }`
  }

  function FieldError({ field }) {
    if (!fieldErrors[field]) return null
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {fieldErrors[field]}
      </p>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-12 dark:bg-slate-950">
      <BackButton to="/" position="top-left" />
      
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
              Multistack<span className="text-brand-600 dark:text-brand-500">Hire</span>
            </span>
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join Multistack Hire to get started
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {/* Backend error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-2.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
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
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass('full_name')}
                />
              </div>
              <FieldError field="full_name" />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass('email')}
                />
              </div>
              <FieldError field="email" />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 chars, uppercase, number, special"
                  className={`${inputClass('password')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye className="h-5 w-4" /> : <EyeOff className="h-5 w-4" />}
                </button>
              </div>

              {/* Field error (if any) */}
              <FieldError field="password" />

              {/* Password requirements hint */}
              {!fieldErrors.password && formData.password.length > 0 && (
                <div className="mt-1.5 grid grid-cols-2 gap-1">
                  {[
                    { label: '8+ characters', test: formData.password.length >= 8 },
                    { label: 'Uppercase letter', test: /[A-Z]/.test(formData.password) },
                    { label: 'Number', test: /[0-9]/.test(formData.password) },
                    { label: 'Special character', test: /[^A-Za-z0-9]/.test(formData.password) },
                  ].map((req) => (
                    <p
                      key={req.label}
                      className={`flex items-center gap-1 text-xs ${
                        req.test
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {req.test ? '✓' : '○'} {req.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Role Selector */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                I am a...
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: 'candidate',
                    label: 'Candidate',
                    desc: 'Looking for opportunities',
                    icon: UserCheck,
                  },
                  {
                    value: 'recruiter',
                    label: 'Recruiter',
                    desc: 'Hiring technical talent',
                    icon: Briefcase,
                  },
                ].map(({ value, label, desc, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors ${
                      formData.role === value
                        ? 'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
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
                      {desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}