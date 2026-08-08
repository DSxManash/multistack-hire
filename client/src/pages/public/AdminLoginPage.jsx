import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff,
  AlertCircle, Layers,
} from 'lucide-react'
import { fadeUp } from '../../components/landing/motion'
import axiosInstance from '../../api/axiosInstance'
import Button from '../../components/ui/Button'
import BackButton from '../../components/ui/BackButton'

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    setError(null)
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

    setIsLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.post(
        '/auth/admin/login',
        formData
      )
      const data = response.data

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/admin/dashboard', { replace: true })
      window.location.href = '/admin/dashboard'
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Invalid email or password. Please try again.'
      )
      setFormData((prev) => ({ ...prev, password: '' }))
      setShowPassword(false)
    } finally {
      setIsLoading(false)
    }
  }

  function inputClass(field, extra = '') {
    return `w-full rounded-lg border py-2.5 pl-10 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${extra} ${
      fieldErrors[field]
        ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-400 focus:ring-red-200 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300'
        : 'border-slate-200 bg-white text-slate-900 focus:border-brand-500 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500'
    }`
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
            Admin Login
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
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
                  placeholder="admin@multistackhire.com"
                  className={inputClass('email', 'pr-4')}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  className={inputClass('password', 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
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

            <Button
              type="submit"
              variant="danger"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
