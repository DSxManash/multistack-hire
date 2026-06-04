import { useState } from 'react'
import { fetchHealth } from './api/healthApi'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function checkBackendHealth() {
    setLoading(true)
    setError(null)
    setHealth(null)

    try {
      const data = await fetchHealth()
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
        Hello Team !
      </h1>
      <p className="mt-2 text-slate-700 text-center">
        lets is ready to roll.
      </p>

      <section className="mt-8 mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Backend integration</h2>
        <p className="mt-1 text-sm text-slate-600">
          Calls{' '}
          <code className="rounded bg-slate-100 px-1">
            GET {(import.meta.env.VITE_API_URL || '') + '/health'}
          </code>
        </p>

        <button
          type="button"
          onClick={checkBackendHealth}
          disabled={loading}
          className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Check backend health'}
        </button>

        {health && (
          <pre className="mt-4 overflow-x-auto rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">
            {JSON.stringify(health, null, 2)}
          </pre>
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  )
}

export default App
