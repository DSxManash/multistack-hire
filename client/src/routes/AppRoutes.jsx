import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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

function getRoleDashboard(role) {
  const dashboards = {
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard',
    candidate: '/candidate/dashboard',
  }
  return dashboards[role] ?? '/'
}

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/login"
          element={isAuthenticated
            ? <Navigate to={getRoleDashboard(user?.role)} replace />
            : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated
            ? <Navigate to={getRoleDashboard(user?.role)} replace />
            : <RegisterPage />}
        />
      </Route>
      <Route
        path="/admin/login"
        element={
          isAuthenticated && user?.role === 'admin'
            ? <Navigate to="/admin/dashboard" replace />
            : <AdminLoginPage />
        }
      />

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
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/search" element={<CandidateSearch />} />
            <Route path="/recruiter/candidates/:id" element={<CandidateDetails />} />
            <Route path="/recruiter/shortlist" element={<Shortlist />} />
            <Route path="/recruiter/company" element={<RecruiterCompany />} />
            <Route path="/recruiter/jobs/:jobId/applications" element={<JobApplications />} />
            <Route path="/recruiter/jobs/:jobId/applications/*" element={<JobApplications />} />
          </Route>
        </Route>

        {/* Candidate */}
        <Route element={<RoleRoute allowedRoles={['candidate']} />}>
          <Route element={<CandidateLayout />}>
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}