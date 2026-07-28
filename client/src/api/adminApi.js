
import axiosInstance from './axiosInstance'

export const getAdminStats = async () => {
  const response = await axiosInstance.get('/users/stats')
  return response.data
}