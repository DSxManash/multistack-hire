/** Role → home dashboard path. Never returns "/" for unknown roles. */
export function getRoleDashboard(role) {
  const dashboards = {
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard',
    candidate: '/candidate/dashboard',
  }
  return dashboards[role] ?? '/login'
}
