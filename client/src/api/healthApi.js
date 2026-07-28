import { API_BASE_URL } from './config'

/**
 * Backend health lives at GET /health (not under /api/v1).
 */
export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`)
  }

  return response.json()
}

export async function fetchHealthDb() {
  const response = await fetch(`${API_BASE_URL}/health/db`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Database health check failed (${response.status})`)
  }

  return data
}
