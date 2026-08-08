
import axiosInstance from './axiosInstance'

export const getProfile = async () => {
  const response = await axiosInstance.get('/candidate/profile')
  return response.data
}

export const updateProfile = async (data) => {
  const response = await axiosInstance.put('/candidate/profile', data)
  return response.data
}

export const uploadResume = async (file) => {
  // FormData required for file upload — not JSON
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosInstance.post('/candidate/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/** Fetch own resume as a blob for in-app PDF preview (authenticated proxy). */
export const getMyResumeBlob = async () => {
  const response = await axiosInstance.get('/candidate/resume', {
    responseType: 'blob',
  })
  return response.data
}



export const getProfileCompletion = async () => {
  const response = await axiosInstance.get('/candidate/profile/completion')
  return response.data
}

// Change Password API 
export const changePassword = async (data) => {
  const response = await axiosInstance.post(
    '/candidate/settings/change-password', data
  )
  return response.data
}


// Get Candidate Stats 
export const getCandidateStats = async () => {
  const response = await axiosInstance.get('/candidate/stats')
  return response.data
}


// Get Candidate Ranking Score
export const getMyRankingScore = async () => {
  const response = await axiosInstance.get('/ranking/score/me')
  return response.data
}

//trigger Candidate Ranking Score with ML Model inference
export const triggerMyScoring = async () => {
  const response = await axiosInstance.post('/ranking/score/me')
  return response.data
}