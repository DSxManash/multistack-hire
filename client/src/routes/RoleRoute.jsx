import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getRoleDashboard } from '../lib/roleHome'


export default function RoleRoute({ allowedRoles }) {
  const { user, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  const hasPermission = user && allowedRoles.includes(user.role)

  if (!hasPermission) {
    if (user?.role) {
      return <Navigate to={getRoleDashboard(user.role)} replace />
    }
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
