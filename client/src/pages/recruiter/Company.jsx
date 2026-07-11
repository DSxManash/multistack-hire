import { useState, useEffect } from 'react'
import { getMyCompany, registerCompany, updateCompany } from '../../api/companyApi'
import {
  Building2, Globe, MapPin, Briefcase, Users,
  CheckCircle2, AlertCircle, Loader2, Save, Plus
} from 'lucide-react'

const companySizes = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
]

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'E-commerce', 'Media', 'Manufacturing', 'Consulting', 'Other'
]

function InputField({ label, icon: Icon, required, textarea, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && !textarea && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        {textarea ? (
          <textarea
            {...props}
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
          />
        ) : (
          <input
            {...props}
            className={`w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
          />
        )}
      </div>
    </div>
  )
}

export default function RecruiterCompany() {
  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    name: '', description: '', address: '',
    website: '', industry: '', size: '',
  })

  useEffect(() => {
    getMyCompany()
      .then(data => {
        setCompany(data)
        if (data) {
          setForm({
            name: data.name ?? '',
            description: data.description ?? '',
            address: data.address ?? '',
            website: data.website ?? '',
            industry: data.industry ?? '',
            size: data.size ?? '',
          })
        }
      })
      .catch(() => setError('Failed to load company'))
      .finally(() => setIsLoading(false))
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Company name is required')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      const result = company
        ? await updateCompany(form)
        : await registerCompany(form)
      setCompany(result)
      setIsEditing(false)
      setSuccessMsg(company ? 'Company updated successfully!' : 'Company registered successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save company')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Company Profile
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {company ? 'Your registered company details' : 'Register your company to start posting jobs'}
          </p>
        </div>
        {company && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Edit
          </button>
        )}
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* View mode — company registered */}
      {company && !isEditing ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white text-lg font-bold">
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {company.name}
              </h3>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                ✓ Registered
              </span>
            </div>
          </div>

          {company.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {company.description}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {company.industry && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                {company.industry}
              </div>
            )}
            {company.size && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="h-4 w-4 text-slate-400 shrink-0" />
                {company.size} employees
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                {company.address}
              </div>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-600 hover:underline dark:text-brand-400"
              >
                <Globe className="h-4 w-4 shrink-0" />
                {company.website}
              </a>
            )}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Registered {new Date(company.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      ) : (
        /* Form mode — register or edit */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-600" />
              {company ? 'Update Company Details' : 'Register Your Company'}
            </h3>

            <InputField
              label="Company Name"
              icon={Building2}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Infodevelopers Nepal"
              required
            />

            <InputField
              label="Description"
              textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of your company..."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Industry
                </label>
                <select
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Select industry</option>
                  {industries.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Company Size
                </label>
                <select
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Select size</option>
                  {companySizes.map(s => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
            </div>

            <InputField
              label="Address"
              icon={MapPin}
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Kathmandu, Nepal"
            />

            <InputField
              label="Website"
              icon={Globe}
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yourcompany.com"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {isSaving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                : company
                ? <><Save className="h-4 w-4" /> Update Company</>
                : <><Plus className="h-4 w-4" /> Register Company</>
              }
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}