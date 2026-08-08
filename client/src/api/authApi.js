import axiosInstance from './axiosInstance'

// Register a new user
export const registerUser = async (data) => {
  const response = await axiosInstance.post('/auth/register', data)
  return response.data
}

// Login existing user
export const loginUser = async (data) => {
  const response = await axiosInstance.post('/auth/login', data)
  return response.data

}

// Get current logged in user profile
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me')
  return response.data
}

export const logoutUser = async () => {
  const response = await axiosInstance.post('/auth/logout')
  return response.data
}