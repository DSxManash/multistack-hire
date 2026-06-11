import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


export default function RoleRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  // Check if user's role is in the allowed list
  const hasPermission = user && allowedRoles.includes(user.role)

  if (!hasPermission) {
    // Wrong role → redirect to their own dashboard
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />
    if (user?.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />

    // for some reason if we don't recognize their role → log them out
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}