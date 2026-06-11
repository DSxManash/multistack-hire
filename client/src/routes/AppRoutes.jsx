
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Guards
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import RecruiterLayout from '../layouts/RecruiterLayout'
import CandidateLayout from '../layouts/CandidateLayout'

// Public Pages
import LandingPage from '../pages/public/LandingPage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import AboutPage from '../pages/public/AboutPage'

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard'
import UserManagement from '../pages/admin/UserManagement'
import ModelManagement from '../pages/admin/ModelManagement'
import RetrainModel from '../pages/admin/RetrainModel'
import SystemAnalytics from '../pages/admin/SystemAnalytics'

// Recruiter Pages
import RecruiterDashboard from '../pages/recruiter/Dashboard'
import CandidateSearch from '../pages/recruiter/CandidateSearch'
import CandidateDetails from '../pages/recruiter/CandidateDetails'
import Shortlist from '../pages/recruiter/Shortlist'
import Analytics from '../pages/recruiter/Analytics'

// Candidate Pages
import CandidateDashboard from '../pages/candidate/Dashboard'
import Profile from '../pages/candidate/Profile'
import ResumeUpload from '../pages/candidate/ResumeUpload'
import Ranking from '../pages/candidate/Ranking'
import Settings from '../pages/candidate/Settings'

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>

      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* If already logged in, redirect away from login/register */}
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

      {/* Protected Routes must be logged in */}
      <Route element={<ProtectedRoute />}>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/model" element={<ModelManagement />} />
            <Route path="/admin/model/retrain" element={<RetrainModel />} />
            <Route path="/admin/analytics" element={<SystemAnalytics />} />
          </Route>
        </Route>

        {/* Recruiter Routes */}
        <Route element={<RoleRoute allowedRoles={['recruiter']} />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/search" element={<CandidateSearch />} />
            <Route path="/recruiter/candidates/:id" element={<CandidateDetails />} />
            <Route path="/recruiter/shortlist" element={<Shortlist />} />
            <Route path="/recruiter/analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* Candidate Routes */}
        <Route element={<RoleRoute allowedRoles={['candidate']} />}>
          <Route element={<CandidateLayout />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<Profile />} />
            <Route path="/candidate/resume" element={<ResumeUpload />} />
            <Route path="/candidate/ranking" element={<Ranking />} />
            <Route path="/candidate/settings" element={<Settings />} />
          </Route>
        </Route>

      </Route>

      {/* ─ Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

function getRoleDashboard(role) {
  const dashboards = {
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard',
    candidate: '/candidate/dashboard',
  }
  return dashboards[role] ?? '/'
}