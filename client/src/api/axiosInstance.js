import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // fail after 10 seconds instead of hanging forever
})

// REQUEST INTERCEPTOR: Runs before every single API call automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (we'll store it here after login)
    const token = localStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config 
  },
  (error) => {
    return Promise.reject(error)
  }
)

//RESPONSE INTERCEPTOR: Runs after every single API response automatically
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default axiosInstance