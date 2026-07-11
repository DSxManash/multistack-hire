/**
 * Centralized backend URL configuration.
 * All API clients must import from here — never hardcode hostnames.
 *
 * Dev:  VITE_API_URL=/api (proxied by Vite)
 * Prod: VITE_API_URL=https://multistack-hire.onrender.com
 */
const raw = import.meta.env.VITE_API_URL?.trim()
const fallbackBase = import.meta.env.DEV
  ? '/api'
  : 'https://multistack-hire.onrender.com'

const resolvedBase = raw || fallbackBase

/** Base URL for API requests. In development this defaults to the Vite proxy path. */
export const API_BASE_URL = String(resolvedBase).replace(/\/$/, '')

/** Versioned REST API root used by the shared Axios instance */
export const API_V1_URL = API_BASE_URL.startsWith('http')
  ? `${API_BASE_URL}/api/v1`
  : `${API_BASE_URL}/v1`
