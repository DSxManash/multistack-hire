import axiosInstance from './axiosInstance'

export const getAdminStats = async () => {
  const response = await axiosInstance.get('/users/stats')
  return response.data
}

export const getAllUsers = async (params = {}) => {
  const response = await axiosInstance.get('/users/', { params })
  return response.data
}

export const activateUser = async (userId) => {
  const response = await axiosInstance.patch(`/users/${userId}/activate`)
  return response.data
}

export const deactivateUser = async (userId) => {
  const response = await axiosInstance.patch(`/users/${userId}/deactivate`)
  return response.data
}

export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.patch(`/users/${userId}/role`, { role })
  return response.data
}

export const deleteUser = async (userId) => {
  await axiosInstance.delete(`/users/${userId}`)
}
