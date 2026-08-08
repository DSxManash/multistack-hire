
import axiosInstance from './axiosInstance'

//  Candidate 

// Browse all active jobs
export const browseJobs = async () => {
  const response = await axiosInstance.get('/jobs')
  return response.data
}

// Apply to a job
export const applyToJob = async (jobId) => {
  const response = await axiosInstance.post(`/jobs/${jobId}/apply`)
  return response.data
}

// Get my applications
export const getMyApplications = async () => {
  const response = await axiosInstance.get('/jobs/my-applications')
  return response.data
}

// ── Recruiter ─────────────────────────────────────────────────────

// Create a new job posting
export const createJob = async (data) => {
  const response = await axiosInstance.post('/jobs', data)
  return response.data
}

// Get jobs posted by the current recruiter
export const getMyJobs = async () => {
  const response = await axiosInstance.get('/jobs/my-jobs')
  return response.data
}

// Close/deactivate a job
export const closeJob = async (jobId) => {
  await axiosInstance.delete(`/jobs/${jobId}`)
}

// Get applications for a specific job
export const getJobApplications = async (jobId) => {
  const response = await axiosInstance.get(`/jobs/${jobId}/applications`)
  return response.data
}

// Update application status
export const updateApplicationStatus = async (applicationId, newStatus) => {
  const response = await axiosInstance.patch(
    `/jobs/applications/${applicationId}/status`,
    null,
    { params: { new_status: newStatus } }
  )
  return response.data
}

// ── Recruiter — Candidates ────────────────────────────────────────

export const searchCandidates = async (search = '') => {
  const response = await axiosInstance.get('/users/candidates', {
    params: search ? { search } : {},
  })
  return response.data
}

export const getCandidateById = async (userId) => {
  const response = await axiosInstance.get(`/users/candidates/${userId}`)
  return response.data
}

// Get all shortlisted candidates across all recruiter's jobs
export const getShortlisted = async () => {
  const response = await axiosInstance.get('/jobs/shortlisted')
  return response.data
}

// Get analytics for the recruiter's jobs
export const getRecruiterAnalytics = async () => {
  const response = await axiosInstance.get('/jobs/analytics')
  return response.data
}


// Get analytics for the recruiter's dashboard
export const getRecruiterDashboardStats = async () => {
  const response = await axiosInstance.get('/jobs/dashboard-stats')
  return response.data
}

// Get ranked applicants for a specific job
export const getRankedApplicants = async (jobId) => {
  const response = await axiosInstance.get(`/ranking/job/${jobId}`)
  return response.data
}

// Get my applications with job details for the candidate dashboard
export const getMyApplicationsWithJobs = async () => {
  const response = await axiosInstance.get('/jobs/my-applications-detail')
  return response.data
}


// Recruiter: score / rank all applicants for a job
export const scoreJobApplicants = async (jobId) => {
  const response = await axiosInstance.post(`/ranking/score/job/${jobId}`)
  return response.data
}

// Recruiter: fetch applicant resume via authenticated API proxy (blob)
export const getApplicantResumeBlob = async (jobId, applicationId) => {
  const response = await axiosInstance.get(
    `/ranking/job/${jobId}/applicant/${applicationId}/resume`,
    { responseType: 'blob' },
  )
  return response.data
}