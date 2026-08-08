
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

// if we're checking auth status  → show loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    )
  }

//if user is NOT authenticated → redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

// If  the user is authenticated → render the protected page
  return <Outlet />
}