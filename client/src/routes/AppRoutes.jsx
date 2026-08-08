import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getRoleDashboard } from '../lib/roleHome'

import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import RecruiterLayout from '../layouts/RecruiterLayout'
import CandidateLayout from '../layouts/CandidateLayout'

import LandingPage from '../pages/public/LandingPage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import AdminLoginPage from '../pages/public/AdminLoginPage'
import AboutPage from '../pages/public/AboutPage'
import NotFoundPage from '../pages/public/NotFoundPage'

import AdminDashboard from '../pages/admin/Dashboard'
import UserManagement from '../pages/admin/UserManagement'
import ModelManagement from '../pages/admin/ModelManagement'

import RecruiterDashboard from '../pages/recruiter/Dashboard'
import CandidateSearch from '../pages/recruiter/CandidateSearch'
import CandidateDetails from '../pages/recruiter/CandidateDetails'
import Shortlist from '../pages/recruiter/Shortlist'

import CandidateDashboard from '../pages/candidate/Dashboard'
import CandidateJobs from '../pages/candidate/Jobs'
import Profile from '../pages/candidate/Profile'
import Ranking from '../pages/candidate/Ranking'
import Settings from '../pages/candidate/Settings'
import RecruiterCompany from '../pages/recruiter/Company'
import RecruiterJobs from '../pages/recruiter/Jobs'

import CandidateApplications from '../pages/candidate/Applications'

import JobApplications from '../pages/recruiter/JobApplications'

const ACTIVE_JOB_STORAGE_KEY = 'recruiterActiveJobId'

function AuthBootSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  )
}

/** Old UUID URLs → store job id privately and open the stable applications route. */
function LegacyJobApplicationsRedirect() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem(ACTIVE_JOB_STORAGE_KEY, jobId)
      navigate('/recruiter/jobs/application', {
        replace: true,
        state: { jobId },
      })
      return
    }
    navigate('/recruiter/jobs', { replace: true })
  }, [jobId, navigate])

  return null
}

export default function AppRoutes() {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <AuthBootSpinner />
  }

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={getRoleDashboard(user?.role)} replace />
              : <LandingPage />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={getRoleDashboard(user?.role)} replace />
              : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to={getRoleDashboard(user?.role)} replace />
              : <RegisterPage />
          }
        />
      </Route>
      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === 'admin'
            ? <Navigate to="/admin/dashboard" replace />
            : <AdminLoginPage />
        }
      />
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>

        {/* Admin */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/model" element={<ModelManagement />} />
            <Route path="/admin/model/retrain" element={<Navigate to="/admin/model" replace />} />
          </Route>
        </Route>

        {/* Recruiter */}
        <Route element={<RoleRoute allowedRoles={['recruiter']} />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/jobs/application" element={<JobApplications />} />
            <Route
              path="/recruiter/jobs/:jobId/applications/*"
              element={<LegacyJobApplicationsRedirect />}
            />
            <Route
              path="/recruiter/jobs/:jobId/applications"
              element={<LegacyJobApplicationsRedirect />}
            />
            <Route path="/recruiter/search" element={<CandidateSearch />} />
            <Route path="/recruiter/candidates/:id" element={<CandidateDetails />} />
            <Route path="/recruiter/shortlistd" element={<Shortlist />} />
            <Route path="/recruiter/shortlist" element={<Navigate to="/recruiter/shortlistd" replace />} />
            <Route path="/recruiter/company" element={<RecruiterCompany />} />
          </Route>
        </Route>

        {/* Candidate */}
        <Route element={<RoleRoute allowedRoles={['candidate']} />}>
          <Route element={<CandidateLayout />}>
            <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/jobs" element={<CandidateJobs />} />
            <Route path="/candidate/profile" element={<Profile />} />
            <Route path="/candidate/ranking" element={<Ranking />} />
            <Route path="/candidate/settings" element={<Settings />} />
            <Route path="/candidate/applications" element={<CandidateApplications />} />
            <Route path="/candidate/resume" element={<Navigate to="/candidate/profile" replace />} />
          </Route>
        </Route>

      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
