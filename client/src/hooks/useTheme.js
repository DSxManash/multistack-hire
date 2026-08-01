import { useEffect, useState } from 'react'

const STORAGE_KEY = 'multistack-hire-theme'

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const isDark = theme === 'dark'

    root.classList.toggle('dark', isDark)
    body.classList.toggle('dark', isDark)

    if (isDark) {
      body.style.backgroundColor = '#020617'
      body.style.color = '#f8fafc'
    } else {
      body.style.backgroundColor = '#f8fafc'
      body.style.color = '#0f172a'
    }

    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
