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
import AboutPage from '../pages/public/AboutPage'

import AdminDashboard from '../pages/admin/Dashboard'
import UserManagement from '../pages/admin/UserManagement'
import ModelManagement from '../pages/admin/ModelManagement'
import RetrainModel from '../pages/admin/RetrainModel'
import SystemAnalytics from '../pages/admin/SystemAnalytics'

import RecruiterDashboard from '../pages/recruiter/Dashboard'
import CandidateSearch from '../pages/recruiter/CandidateSearch'
import CandidateDetails from '../pages/recruiter/CandidateDetails'
import Shortlist from '../pages/recruiter/Shortlist'
import Analytics from '../pages/recruiter/Analytics'

import CandidateDashboard from '../pages/candidate/Dashboard'
import CandidateJobs from '../pages/candidate/Jobs'
import Profile from '../pages/candidate/Profile'
import ResumeUpload from '../pages/candidate/ResumeUpload'
import Ranking from '../pages/candidate/Ranking'
import Settings from '../pages/candidate/Settings'
import RecruiterCompany from '../pages/recruiter/Company'
import RecruiterJobs from '../pages/recruiter/Jobs'

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

      {/* Protected */}
      <Route element={<ProtectedRoute />}>

        {/* Admin */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/model" element={<ModelManagement />} />
            <Route path="/admin/model/retrain" element={<RetrainModel />} />
            <Route path="/admin/analytics" element={<SystemAnalytics />} />
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
            <Route path="/recruiter/analytics" element={<Analytics />} />
            <Route path="/recruiter/company" element={<RecruiterCompany />} />
          </Route>
        </Route>

        {/* Candidate */}
        <Route element={<RoleRoute allowedRoles={['candidate']} />}>
          <Route element={<CandidateLayout />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/jobs" element={<CandidateJobs />} />
            <Route path="/candidate/profile" element={<Profile />} />
            <Route path="/candidate/resume" element={<ResumeUpload />} />
            <Route path="/candidate/ranking" element={<Ranking />} />
            <Route path="/candidate/settings" element={<Settings />} />
          </Route>
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}