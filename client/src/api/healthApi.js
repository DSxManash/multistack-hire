import { HEALTH_BASE_URL } from './config'

/**
 * Backend health lives at GET /health (not under /api/v1).
 */
export async function fetchHealth() {
  const response = await fetch(`${HEALTH_BASE_URL}/health`)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || `Health check failed (${response.status})`)
  }

  return data
}

export async function fetchHealthDb() {
  const response = await fetch(`${HEALTH_BASE_URL}/health/db`)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || `Database health check failed (${response.status})`)
  }

  return data
}

export async function fetchHealthStorage() {
  const response = await fetch(`${HEALTH_BASE_URL}/health/storage`)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const err = new Error(data.error || `Storage health check failed (${response.status})`)
    err.data = data
    throw err
  }

  return data
}

async function probe(path) {
  try {
    const response = await fetch(`${HEALTH_BASE_URL}${path}`)
    const data = await response.json().catch(() => ({}))
    return { ok: response.ok, statusCode: response.status, data }
  } catch (err) {
    return { ok: false, statusCode: 0, data: { error: err.message } }
  }
}

/**
 * Normalize API / DB / storage probes into healthy | degraded | unavailable.
 */
export function normalizeApiHealth(probeResult) {
  if (probeResult.ok && probeResult.data?.status === 'healthy') {
    return {
      status: 'healthy',
      note: `API v${probeResult.data.version ?? '—'} responding`,
    }
  }
  return {
    status: 'unavailable',
    note: probeResult.data?.error || 'Health check failed',
  }
}

export function normalizeDbHealth(probeResult) {
  if (probeResult.ok && probeResult.data?.status === 'ok') {
    const tableCount = Array.isArray(probeResult.data.tables)
      ? probeResult.data.tables.length
      : 0
    if (tableCount === 0) {
      return { status: 'degraded', note: 'Connected, but no tables found' }
    }
    return { status: 'healthy', note: `Connected · ${tableCount} tables` }
  }
  return {
    status: 'unavailable',
    note: probeResult.data?.error || 'Database unreachable',
  }
}

export function normalizeStorageHealth(probeResult) {
  const data = probeResult.data || {}
  if (probeResult.ok && data.status === 'ok' && data.bucket_exists) {
    return { status: 'healthy', note: `Bucket “${data.bucket}” available` }
  }
  if (data.status === 'degraded' || data.bucket_exists === false) {
    return { status: 'degraded', note: data.error || 'Bucket missing' }
  }
  return {
    status: 'unavailable',
    note: data.error || 'Storage unreachable',
  }
}

/** Probe all configured services once. Never throws. */
export async function fetchAllServiceHealth() {
  const [api, db, storage] = await Promise.all([
    probe('/health'),
    probe('/health/db'),
    probe('/health/storage'),
  ])

  return {
    api: normalizeApiHealth(api),
    db: normalizeDbHealth(db),
    storage: normalizeStorageHealth(storage),
  }
}

/** Aggregate overall system health from per-service statuses. */
export function aggregateSystemHealth(services) {
  const statuses = Object.values(services).map((s) => s.status)
  if (statuses.length === 0 || statuses.some((s) => s === 'checking')) {
    return { value: 'Checking', sub: 'Probing services…', color: 'amber' }
  }
  const healthy = statuses.filter((s) => s === 'healthy').length
  const total = statuses.length
  if (healthy === total) {
    return { value: 'Healthy', sub: 'All services running', color: 'green' }
  }
  if (healthy === 0) {
    return { value: 'Unavailable', sub: 'Services unreachable', color: 'red' }
  }
  return {
    value: 'Degraded',
    sub: `${healthy}/${total} services healthy`,
    color: 'amber',
  }
}
