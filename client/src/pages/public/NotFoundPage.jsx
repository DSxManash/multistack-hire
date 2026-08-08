import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getRoleDashboard } from '../../lib/roleHome'

export default function NotFoundPage() {
  const { isAuthenticated, user } = useAuth()
  const homePath = isAuthenticated ? getRoleDashboard(user?.role) : '/'
  const homeLabel = isAuthenticated ? 'Back to dashboard' : 'Go to home'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
        <Layers className="h-6 w-6" strokeWidth={2} />
      </div>
      <p className="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
        The page you requested does not exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={homePath}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {homeLabel}
        </Link>
        {!isAuthenticated && (
          <Link
            to="/login"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  )
}
