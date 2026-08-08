/** Router basename for subpath deploys (empty for custom domain / root hosting). */
export const appBasePath = (import.meta.env.VITE_ROUTER_BASENAME ?? '')
  .replace(/\/$/, '')

/** Prefix an app route with the router basename (for full-page redirects). */
export function appPath(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${appBasePath}${normalized}`
}
