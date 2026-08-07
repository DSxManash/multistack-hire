import { useState, useEffect } from 'react'
import { getMyCompany, registerCompany, updateCompany } from '../../api/companyApi'
import {
  Building2, Globe, MapPin, Briefcase, Users,
  CheckCircle2, AlertCircle, Loader2, Save, Plus,
  X, UploadCloud, Calendar, Pencil
} from 'lucide-react'

const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
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
    website: '', industry: '', size: '', logo_url: '',
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
            logo_url: data.logo_url ?? '', // Backend field ready for future integration
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

  // Determine initials for logo fallback
  const initials = company?.name
    ? company.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  
  const hasLogo = form.logo_url || company?.logo_url

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
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

      {/* ── VIEW MODE: Professional Company Profile Page ── */}
      {company && !isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Logo & Identity */}
          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 h-fit">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700 shadow-sm ring-4 ring-white dark:bg-brand-950 dark:text-brand-300 dark:ring-slate-900">
              {hasLogo ? (
                <img 
                  src={hasLogo} 
                  alt={company.name} 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {company.name}
              </h3>
              {company.industry && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {company.industry}
                </p>
              )}
            </div>
            <div className="mt-4 w-full space-y-2">
              <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400 ring-1 ring-green-200/40 dark:ring-green-800/40">
                <CheckCircle2 className="h-3 w-3" />
                Registered Company
              </span>
              {company.size && (
                <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Users className="h-3 w-3" />
                  {company.size} employees
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            {/* Description */}
            {company.description && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">About the Company</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {company.website && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Website</p>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline dark:text-brand-400 truncate block max-w-[200px]">
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
              {company.address && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{company.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Meta */}
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Calendar className="h-3.5 w-3.5" />
              Registered on {new Date(company.created_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── FORM MODE: Register or Edit ── */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Col: Core Identity */}
          <div className="xl:col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 h-fit space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-600" />
              Identity & Branding
            </h3>
            
            {/* Logo Upload Visual Placeholder */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo Preview" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8" />
                )}
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Logo URL</p>
                <input 
                  type="text" 
                  name="logo_url"
                  value={form.logo_url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <InputField
              label="Company Name"
              icon={Building2}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Infodevelopers Nepal"
              required
            />

            <div className="grid grid-cols-1 gap-4">
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
          </div>

          {/* Right Col: Details & Info */}
          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-brand-600" />
              Company Details
            </h3>

            <InputField
              label="Description"
              textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of your company..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Form Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 shadow-sm"
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
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  )
}