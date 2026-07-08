
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

export const getProfileCompletion = async () => {
  const response = await axiosInstance.get('/candidate/profile/completion')
  return response.data
}