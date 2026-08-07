/**
 * Centralized backend URL configuration.
 * All API clients must import from here — never hardcode hostnames.
 *
 * Dev / same-origin Docker:  VITE_API_URL=/api  (Vite or Caddy proxies /api → backend)
 * Split hosting (e.g. Pages + Render): VITE_API_URL=https://api.example.com
 */
const raw = import.meta.env.VITE_API_URL?.trim()
const fallbackBase = import.meta.env.DEV
  ? '/api'
  : '/api'

const resolvedBase = raw || fallbackBase

/** Base URL for API requests. Relative values are same-origin proxy paths. */
export const API_BASE_URL = String(resolvedBase).replace(/\/$/, '')

const isAbsoluteApi = /^https?:\/\//i.test(API_BASE_URL)

/** Versioned REST API root used by the shared Axios instance */
export const API_V1_URL = isAbsoluteApi
  ? `${API_BASE_URL}/api/v1`
  : `${API_BASE_URL}/v1`

/**
 * Health endpoints live at GET /health (not under /api/v1).
 * Absolute API hosts: {origin}/health
 * Relative /api proxy: /health (Caddy/Vite expose it at the site root)
 */
export const HEALTH_BASE_URL = isAbsoluteApi ? API_BASE_URL : ''
