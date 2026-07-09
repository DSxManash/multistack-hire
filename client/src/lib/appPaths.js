/** Vite `base` without trailing slash — empty string for local `/` base. */
export const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Prefix an app route with the Vite base path (for GitHub Pages subfolder deploys). */
export function appPath(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${appBasePath}${normalized}`
}
