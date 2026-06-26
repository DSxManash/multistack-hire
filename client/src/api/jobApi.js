

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