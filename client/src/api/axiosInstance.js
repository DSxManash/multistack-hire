import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // fail after 10 seconds instead of hanging forever
  withCredentials: true,
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

// RESPONSE INTERCEPTOR: Runs after every single API response automatically
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const response = await axiosInstance.post('/auth/refresh')
        const { access_token } = response.data

        localStorage.setItem('access_token', access_token)
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${access_token}`

        onRefreshed(access_token)
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance