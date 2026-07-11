import axiosInstance from './axiosInstance'

export const getMyCompany = async () => {
  const response = await axiosInstance.get('/company')
  return response.data
}

export const registerCompany = async (data) => {
  const response = await axiosInstance.post('/company', data)
  return response.data
}

export const updateCompany = async (data) => {
  const response = await axiosInstance.put('/company', data)
  return response.data
}