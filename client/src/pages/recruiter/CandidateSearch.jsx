
import { useState, useEffect, useCallback } from 'react'
import { searchCandidates } from '../../api/jobApi'
import {
  Search, Users, Mail, Calendar,
  Loader2, UserCheck
} from 'lucide-react'

export default function CandidateSearch() {
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Load all candidates on mount
  useEffect(() => {
    searchCandidates()
      .then(setCandidates)
      .finally(() => setIsLoading(false))
  }, [])

  // Debounced search — waits 400ms after user stops typing
  // prevents firing an API call on every keystroke
  useEffect(() => {
    if (search === '') {
      searchCandidates().then(setCandidates)
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchCandidates(search)
        setCandidates(results)
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Search Candidates
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        {isSearching
          ? <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-500" />
          : <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        }
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {/* Candidate grid */}
      {candidates.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-950">
          <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {search ? 'No candidates match your search' : 'No candidates registered yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {candidate.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {candidate.full_name}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                    <UserCheck className="h-3 w-3" />
                    Candidate
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  Joined {new Date(candidate.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  candidate.is_active
                    ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                }`}>
                  {candidate.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}