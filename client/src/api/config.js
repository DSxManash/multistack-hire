/**
 * Centralized backend URL configuration.
 * All API clients must import from here — never hardcode hostnames.
 *
 * Dev:  VITE_API_URL=http://localhost:8000
 * Prod: VITE_API_URL=https://multistack-hire.onrender.com
 */
const raw = import.meta.env.VITE_API_URL

if (!raw) {
  throw new Error(
    'VITE_API_URL is not set. Add it to client/.env (local) or GitHub Actions vars (CI).'
  )
}

/** Backend origin only — no trailing slash (e.g. https://multistack-hire.onrender.com) */
export const API_BASE_URL = String(raw).replace(/\/$/, '')

/** Versioned REST API root used by the shared Axios instance */
export const API_V1_URL = `${API_BASE_URL}/api/v1`
