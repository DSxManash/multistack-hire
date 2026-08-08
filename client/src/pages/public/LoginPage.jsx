import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layers, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getRoleDashboard } from '../../lib/roleHome'
import { fadeUp } from '../../components/landing/motion'
import Button from '../../components/ui/Button'
import BackButton from '../../components/ui/BackButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(prev => !prev)

  function handleChange(e) {
    clearError()
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }))
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validate() {
    const errors = {}
    if (!formData.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.password) {
      errors.password = 'Password is required'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    try {
      const user = await login(formData)
      navigate(getRoleDashboard(user.role), { replace: true })
    } catch {
      // error shown via AuthContext
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 dark:bg-slate-950">
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
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to your account to continue
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
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors
                    ${
                      fieldErrors.email
                        ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-400 focus:ring-red-200 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-brand-500 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
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
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors
                    ${
                      fieldErrors.password
                        ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-400 focus:ring-red-200 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-brand-500 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                    }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-4" />
                  ) : (
                    <EyeOff className="h-5 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Create one
              </Link>
            </p>
            {/* <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 dark:bg-slate-950 dark:text-slate-500">or</span>
              </div>
            </div> */}
            {/* <Link
              to="/admin"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Login
            </Link> */}
          </div>
        </div>
      </motion.div>
    </div>
  )
}