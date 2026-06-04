const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export async function fetchHealth() {
  const url = API_BASE ? `${API_BASE}/health` : '/health'
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`)
  }

  return response.json()
}
