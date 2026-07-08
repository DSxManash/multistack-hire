// client/src/pages/candidate/Profile.jsx

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  getProfile, updateProfile, uploadResume, getProfileCompletion
} from '../../api/candidateApi'
import {
  User, Mail, Phone, MapPin, FileText, Github,
  Linkedin, Globe, Briefcase, Plus, X, Upload,
  CheckCircle2, AlertCircle, Loader2, ExternalLink, Save
} from 'lucide-react'

// ── Profile Completion Bar ─────────────────────────────────────
function CompletionBar({ percentage, missing }) {
  const color = percentage === 100
    ? 'bg-green-500'
    : percentage >= 60
    ? 'bg-brand-600'
    : 'bg-amber-500'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Profile Completion
        </h3>
        <span className={`text-sm font-bold ${
          percentage === 100
            ? 'text-green-600'
            : percentage >= 60
            ? 'text-brand-600'
            : 'text-amber-600'
        }`}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {missing.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Missing fields:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((field) => (
              <span
                key={field}
                className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
      {percentage === 100 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Profile complete — you can apply to jobs
        </p>
      )}
    </div>
  )
}

// ── Skills Input ───────────────────────────────────────────────
function SkillsInput({ skills, onChange }) {
  const [input, setInput] = useState('')

  function addSkill(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const newSkill = input.trim().replace(/,$/, '')
      if (!skills.includes(newSkill)) {
        onChange([...skills, newSkill])
      }
      setInput('')
    }
  }

  function removeSkill(skill) {
    onChange(skills.filter(s => s !== skill))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map(skill => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-400"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addSkill}
        placeholder="Type a skill and press Enter (e.g. React, Python)"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
      />
      <p className="mt-1 text-xs text-slate-400">Press Enter or comma to add a skill</p>
    </div>
  )
}

// ── Input Field ────────────────────────────────────────────────
function InputField({ label, icon: Icon, required, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          {...props}
          className={`w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  )
}

// ── Main Profile Page ──────────────────────────────────────────
export default function CandidateProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [error, setError] = useState(null)

  // Form state
  const [form, setForm] = useState({
    phone_number: '',
    location: '',
    bio: '',
    years_of_experience: '',
    github_username: '',
    stackoverflow_username: '',
    linkedin_url: '',
  })
  const [skills, setSkills] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [profileData, completionData] = await Promise.all([
          getProfile(),
          getProfileCompletion(),
        ])
        setProfile(profileData)
        setCompletion(completionData)
        // Populate form with existing data
        setForm({
          phone_number: profileData.phone_number ?? '',
          location: profileData.location ?? '',
          bio: profileData.bio ?? '',
          years_of_experience: profileData.years_of_experience ?? '',
          github_username: profileData.github_username ?? '',
          stackoverflow_username: profileData.stackoverflow_username ?? '',
          linkedin_url: profileData.linkedin_url ?? '',
        })
        setSkills(profileData.skills ?? [])
      } catch {
        setError('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const updated = await updateProfile({
        ...form,
        years_of_experience: form.years_of_experience
          ? parseInt(form.years_of_experience)
          : null,
        skills,
      })
      setProfile(updated)
      const completionData = await getProfileCompletion()
      setCompletion(completionData)
      setSuccessMsg('Profile saved successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      const updated = await uploadResume(file)
      setProfile(updated)
      const completionData = await getProfileCompletion()
      setCompletion(completionData)
      setSuccessMsg('Resume uploaded successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload resume')
    } finally {
      setIsUploading(false)
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
    <div className="space-y-6 max-w-3xl">

      {/* Completion bar */}
      {completion && (
        <CompletionBar
          percentage={completion.percentage}
          missing={completion.missing}
        />
      )}

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

      <form onSubmit={handleSave} className="space-y-6">

        {/* Section 1 — Personal Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-brand-600" />
            Personal Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Read-only fields */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {user?.full_name}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {user?.email}
                </span>
              </div>
            </div>
            <InputField
              label="Phone Number"
              icon={Phone}
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+977 98XXXXXXXX"
            />
            <InputField
              label="Location"
              icon={MapPin}
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Kathmandu, Nepal"
            />
            <InputField
              label="Years of Experience"
              icon={Briefcase}
              name="years_of_experience"
              type="number"
              min="0"
              max="50"
              value={form.years_of_experience}
              onChange={handleChange}
              placeholder="e.g. 3"
            />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description about yourself..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Section 2 — Social Links (ML Critical) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-600" />
            Social Links
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-400">
              Required for ML scoring
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            These are used by the AI ranking engine to evaluate your technical profile.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <InputField
                label="GitHub Username"
                icon={Github}
                name="github_username"
                value={form.github_username}
                onChange={handleChange}
                placeholder="e.g. octocat"
                required
              />
              {form.github_username && (
                <a
                  href={'https://github.com/' + form.github_username}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View GitHub profile
                </a>
              )}
            </div>
            <div>
              <InputField
                label="StackOverflow Username"
                icon={Globe}
                name="stackoverflow_username"
                value={form.stackoverflow_username}
                onChange={handleChange}
                placeholder="e.g. 1234567/username"
                required
              />
              {form.stackoverflow_username && (
                <a
                  href={'https://stackoverflow.com/users/' + form.stackoverflow_username}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View StackOverflow profile
                </a>
              )}
            </div>
            <InputField
              label="LinkedIn URL"
              icon={Linkedin}
              name="linkedin_url"
              value={form.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        {/* Section 3 — Skills */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-600" />
            Skills
          </h3>
          <SkillsInput skills={skills} onChange={setSkills} />
        </div>

        {/* Section 4 — Resume */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            Resume / CV
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
              Required
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            PDF only, maximum 5MB. Used for AI-powered resume parsing.
          </p>

          {profile?.resume_url ? (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Resume uploaded
                  </p>
                  {profile.resume_uploaded_at && (
                    <p className="text-xs text-green-600 dark:text-green-500">
                      Last updated {new Date(profile.resume_uploaded_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-green-700 hover:underline dark:text-green-400"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-8 text-sm font-medium text-slate-500 hover:border-brand-300 hover:text-brand-600 disabled:opacity-60 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:text-brand-400"
            >
              {isUploading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Uploading...</>
                : <><Upload className="h-5 w-5" /> Click to upload PDF resume</>
              }
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isSaving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            : <><Save className="h-4 w-4" /> Save Profile</>
          }
        </button>
      </form>
    </div>
  )
}