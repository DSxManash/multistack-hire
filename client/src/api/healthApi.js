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
