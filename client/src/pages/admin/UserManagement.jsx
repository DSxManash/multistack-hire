import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getAllUsers,
  activateUser,
  deactivateUser,
  updateUserRole,
  deleteUser,
} from '../../api/adminApi'
import {
  Search,
  Users,
  Loader2,
  UserCheck,
  UserX,
  Trash2,
  AlertCircle,
  Shield,
  Briefcase,
} from 'lucide-react'

const ROLES = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'candidate', label: 'Candidate' },
]

const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const roleStyles = {
  admin: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  recruiter: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  candidate: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
}

const roleIcons = {
  admin: Shield,
  recruiter: Briefcase,
  candidate: UserCheck,
}

function RoleBadge({ role }) {
  const Icon = roleIcons[role] ?? UserCheck
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleStyles[role] ?? ''}`}>
      <Icon className="h-3 w-3" />
      {role}
    </span>
  )
}

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function loadUsers() {
    setError(null)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch {
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter === 'active' && !u.is_active) return false
      if (statusFilter === 'inactive' && u.is_active) return false
      if (!term) return true
      return (
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    })
  }, [users, search, roleFilter, statusFilter])

  async function handleToggleActive(targetUser) {
    if (targetUser.id === currentUser?.id) return
    setActionId(targetUser.id)
    setError(null)
    try {
      const updated = targetUser.is_active
        ? await deactivateUser(targetUser.id)
        : await activateUser(targetUser.id)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to update user status')
    } finally {
      setActionId(null)
    }
  }

  async function handleRoleChange(targetUser, newRole) {
    if (targetUser.id === currentUser?.id || targetUser.role === newRole) return
    setActionId(targetUser.id)
    setError(null)
    try {
      const updated = await updateUserRole(targetUser.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to change user role')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setActionId(deleteTarget.id)
    setError(null)
    try {
      await deleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to delete user')
    } finally {
      setActionId(null)
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
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          User Management
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-950">
          <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {search || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No users match your filters'
              : 'No users registered yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">User</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Joined</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id
                  const isBusy = actionId === u.id

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-white">
                              {u.full_name}
                              {isSelf && (
                                <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <RoleBadge role={u.role} />
                        ) : (
                          <select
                            value={u.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs capitalize focus:border-brand-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="candidate">Candidate</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.is_active
                            ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(u.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => handleToggleActive(u)}
                                disabled={isBusy}
                                title={u.is_active ? 'Deactivate' : 'Activate'}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                              >
                                {isBusy
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : u.is_active
                                    ? <UserX className="h-4 w-4" />
                                    : <UserCheck className="h-4 w-4" />
                                }
                              </button>
                              <button
                                onClick={() => setDeleteTarget(u)}
                                disabled={isBusy}
                                title="Delete user"
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Delete user?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Permanently delete <strong>{deleteTarget.full_name}</strong> ({deleteTarget.email})?
              This removes their profile, applications, and related data. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionId === deleteTarget.id}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {actionId === deleteTarget.id && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
