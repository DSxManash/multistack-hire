import axiosInstance from './axiosInstance'

export async function fetchHealth() {
  const response = await axiosInstance.get('/health')
  return response.data
}
