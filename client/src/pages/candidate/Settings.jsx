// client/src/pages/candidate/Settings.jsx

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { changePassword } from '../../api/candidateApi'
import {
  Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2, Save, ShieldCheck
} from 'lucide-react'

function PasswordInput({ label, name, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show
            ? <EyeOff className="h-4 w-4" />
            : <Eye className="h-4 w-4" />
          }
        </button>
      </div>
    </div>
  )
}

export default function CandidateSettings() {
  const { user, logout } = useAuth()

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  function toggleShow(field) {
    setShow(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Client-side validation
  function validate() {
    if (form.new_password.length < 8) {
      setError('New password must be at least 8 characters')
      return false
    }
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match')
      return false
    }
    if (form.current_password === form.new_password) {
      setError('New password must be different from current password')
      return false
    }
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await changePassword(form)
      setSuccessMsg('Password changed successfully! Please log in again.')
      setForm({ current_password: '', new_password: '', confirm_password: '' })

      // Log out after 2 seconds — token should be refreshed
      setTimeout(() => logout(), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  function getStrength(password) {
    if (!password) return null
    if (password.length < 8) return { label: 'Too short', color: 'bg-red-500', width: '25%' }
    if (password.length < 10) return { label: 'Weak', color: 'bg-amber-500', width: '50%' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { label: 'Medium', color: 'bg-yellow-500', width: '75%' }
    }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }

  const strength = getStrength(form.new_password)

  return (
    <div className="space-y-6 max-w-lg">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Settings
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage your account security
        </p>
      </div>

      {/* Account info card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {user?.full_name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
          <span className="ml-auto rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
            Candidate
          </span>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          Change Password
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          After changing your password you will be logged out automatically.
        </p>

        {/* Success */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Current Password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
            show={show.current}
            onToggle={() => toggleShow('current')}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            show={show.new}
            onToggle={() => toggleShow('new')}
            placeholder="Min. 8 characters"
          />

          {/* Password strength bar */}
          {strength && (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Strength: <span className="font-medium">{strength.label}</span>
              </p>
            </div>
          )}

          <PasswordInput
            label="Confirm New Password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            show={show.confirm}
            onToggle={() => toggleShow('confirm')}
            placeholder="Re-enter new password"
          />

          {/* Match indicator */}
          {form.confirm_password && form.new_password && (
            <p className={`text-xs flex items-center gap-1 ${
              form.new_password === form.confirm_password
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}>
              {form.new_password === form.confirm_password
                ? <><CheckCircle2 className="h-3.5 w-3.5" /> Passwords match</>
                : <><AlertCircle className="h-3.5 w-3.5" /> Passwords do not match</>
              }
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {isLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Changing...</>
              : <><Save className="h-4 w-4" /> Change Password</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}